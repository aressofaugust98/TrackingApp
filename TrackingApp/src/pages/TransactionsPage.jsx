import React, { useEffect, useMemo, useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import InAppScanner from '../components/InAppScanner';
import { extractInvoice } from '../services/ocrService';
import { getTransactions, createTransaction, createTransfer, deleteTransaction } from '@/services/transactionService';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapExtractedInvoiceToPrefill = (ocrResponse) => {
  const extracted = ocrResponse?.extracted || {};
  const localDateTime = typeof extracted.LocalDateTime === 'string' ? extracted.LocalDateTime.trim() : '';
  const [datePart = '', timePartRaw = ''] = localDateTime.split(' ');
  const timePart = timePartRaw ? timePartRaw.slice(0, 5) : '';

  return {
    amount: extracted.Total ?? '',
    date: datePart,
    time: timePart,
    type: 'expense',
    note: `Quét tự động - ${extracted.Category || ''}`.trim(),
  };
};

const TransactionsPage = ({ wallets = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);

  const loadData = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(endOfMonth);

    try {
      const data = await getTransactions(startDate, endDate);
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data?.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const normalizedType = String(transaction.type || '').toLowerCase();
        if (normalizedType === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const handleOpenForm = (transaction = null) => {
    setPrefilledData(null);
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransaction(null);
    setPrefilledData(null);
  };

  const handleSaveTransaction = async (data) => {
    try {
      const createdAt = new Date(`${data.date}T${data.time || '00:00'}:00`).toISOString();

      if (data.type === 'transfer') {
        await createTransfer({
          amount: Number(data.amount),
          note: data.note,
          createdAt,
          sourceWalletId: Number(data.sourceWallet),
          destinationWalletId: Number(data.destinationWallet),
        });
      } else {
        await createTransaction({
          amount: Number(data.amount),
          note: data.note,
          type: String(data.type).toUpperCase(),
          createdAt,
          categoryId: Number(data.category),
          walletId: Number(data.wallet),
        });
      }

      alert('Giao dịch thành công!');
      setFormOpen(false);
      setEditingTransaction(null);
      setPrefilledData(null);
      await loadData();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Tạo giao dịch thất bại. Vui lòng thử lại.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xoá giao dịch này?');
    if (!confirmed) return;

    try {
      await deleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Xoá giao dịch thất bại. Vui lòng thử lại.');
    }
  };

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
  };

  const handleImageCaptured = async (imageBlob) => {
    setIsExtracting(true);

    try {
      const extractedData = await extractInvoice(imageBlob);
      console.log('EXTRACTED INVOICE DATA:', extractedData);
      setPrefilledData(mapExtractedInvoiceToPrefill(extractedData));
      setEditingTransaction(null);
      setIsScannerOpen(false);
      setFormOpen(true);
    } catch (error) {
      console.error('AI processing failed', error);
      alert('Lỗi phân tích hóa đơn, vui lòng nhập thủ công');
      setPrefilledData(null);
      setEditingTransaction(null);
      setIsScannerOpen(false);
      setFormOpen(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const netBalance = summary.income - summary.expense;
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-28 md:pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-indigo-600 font-semibold">Giao dịch</p>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thu chi cá nhân</h1>
          <p className="text-gray-600">
            Nhập, chỉnh sửa và xoá các khoản thu/chi. Thiết kế tối ưu cho mọi kích thước màn hình.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Thu nhập</p>
            <p className="text-2xl font-semibold text-emerald-600 mt-1">{formatCurrency(summary.income)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Chi tiêu</p>
            <p className="text-2xl font-semibold text-rose-600 mt-1">{formatCurrency(summary.expense)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Còn lại</p>
            <p className={`text-2xl font-semibold ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'} mt-1`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          onOpenManualForm={() => handleOpenForm()}
          onOpenScanner={handleOpenScanner}
          onEdit={(transaction) => handleOpenForm(transaction)}
          onDelete={handleDeleteTransaction}
        />
      </div>

      <TransactionForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        prefilledData={prefilledData}
        wallets={wallets}
      />

      {isScannerOpen && (
        <InAppScanner
          onClose={() => setIsScannerOpen(false)}
          onCapture={handleImageCaptured}
        />
      )}

      {isExtracting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/55 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-gray-900">Đang nhờ AI đọc hóa đơn...</p>
            <p className="mt-1 text-xs text-gray-500">AI đang trích xuất số tiền, danh mục và thời gian giao dịch.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
