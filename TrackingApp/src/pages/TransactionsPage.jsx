import React, { useMemo, useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import InAppScanner from '../components/InAppScanner';

const createDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const initialTransactions = [
  {
    id: 'txn-1',
    category: 'Salary',
    note: 'Lương tháng 1',
    amount: 25000000,
    type: 'income',
    date: createDateString(0),
    time: '09:00',
  },
  {
    id: 'txn-2',
    category: 'Food',
    note: 'Bữa sáng Phở Thìn',
    amount: 75000,
    type: 'expense',
    date: createDateString(0),
    time: '07:45',
  },
  {
    id: 'txn-3',
    category: 'Transport',
    note: 'GrabCar tới công ty',
    amount: 90000,
    type: 'expense',
    date: createDateString(0),
    time: '08:20',
  },
  {
    id: 'txn-4',
    category: 'Shopping',
    note: 'Áo sơ mi Uniqlo',
    amount: 650000,
    type: 'expense',
    date: createDateString(1),
    time: '18:30',
  },
  {
    id: 'txn-5',
    category: 'Entertainment',
    note: 'CGV cuối tuần',
    amount: 320000,
    type: 'expense',
    date: createDateString(2),
    time: '20:10',
  },
  {
    id: 'txn-6',
    category: 'Utilities',
    note: 'Hoá đơn internet',
    amount: 280000,
    type: 'expense',
    date: createDateString(3),
    time: '10:05',
  },
  {
    id: 'txn-7',
    category: 'Travel',
    note: 'Vé máy bay Đà Nẵng',
    amount: 4800000,
    type: 'expense',
    date: createDateString(5),
    time: '11:15',
  },
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const mockProcessImage = async (file) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!file) {
        reject(new Error('Missing image file'));
        return;
      }

      resolve({
        type: 'Chi tiêu',
        category: 'Food',
        amount: 150000,
        date: '2026-03-28T20:59',
      });
    }, 2000);
  });
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
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

  const handleSaveTransaction = (payload) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((item) => (item.id === editingTransaction.id ? { ...item, ...payload } : item))
      );
    } else {
      setTransactions((prev) => [
        {
          id: generateId(),
          ...payload,
        },
        ...prev,
      ]);
    }
    handleCloseForm();
  };

  const handleDeleteTransaction = (transaction) => {
    const confirmed = window.confirm('Bạn có chắc muốn xoá giao dịch này?');
    if (!confirmed) return;
    setTransactions((prev) => prev.filter((item) => item.id !== transaction.id));
  };

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
  };

  const handleImageCaptured = async (file) => {
    setIsScannerOpen(false);
    setIsProcessing(true);

    try {
      const data = await mockProcessImage(file);
      setPrefilledData(data);
      setEditingTransaction(null);
      setFormOpen(true);
    } catch (error) {
      console.error('AI processing failed', error);
      alert('Lỗi phân tích hóa đơn!');
    } finally {
      setIsProcessing(false);
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
          onEditTransaction={(transaction) => handleOpenForm(transaction)}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>

      <TransactionForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        prefilledData={prefilledData}
      />

      {isScannerOpen && (
        <InAppScanner
          onClose={() => setIsScannerOpen(false)}
          onCapture={handleImageCaptured}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/55 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-gray-900">Dang xu ly anh...</p>
            <p className="mt-1 text-xs text-gray-500">AI dang trich xuat so tien, danh muc va thoi gian giao dich.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
