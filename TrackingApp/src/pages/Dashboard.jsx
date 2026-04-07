import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import BalanceCard from '../components/BalanceCard';
import InAppScanner from '../components/InAppScanner';
import RecentTransactions from '../components/RecentTransactions';
import TransactionForm from '../components/TransactionForm';
import { extractInvoice } from '../services/ocrService';
import { createTransaction, createTransfer, getTransactions } from '../services/transactionService.js';

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

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.round(Number(value) || 0));

const getNormalizedType = (transaction) => String(transaction?.type || '').trim().toUpperCase();

const getTransactionDate = (createdAt) => {
  if (!createdAt) return null;
  const normalized = String(createdAt).replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLastSevenDaysChartData = (transactions = []) => {
  const today = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const buckets = new Map();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = formatDate(date);
    buckets.set(key, {
      day: dayNames[date.getDay()],
      spending: 0,
    });
  }

  transactions.forEach((transaction) => {
    if (getNormalizedType(transaction) !== 'EXPENSE') {
      return;
    }

    const parsedDate = getTransactionDate(transaction.createdAt);
    if (!parsedDate) return;

    const key = formatDate(parsedDate);
    const bucket = buckets.get(key);
    if (!bucket) return;

    bucket.spending += Math.abs(Number(transaction.amount) || 0);
  });

  return Array.from(buckets.values());
};

const Dashboard = ({ wallets = [], onRefreshTransactions, onRefreshWallets }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = Math.abs(Number(transaction.amount) || 0);
        const normalizedType = getNormalizedType(transaction);

        if (normalizedType === 'INCOME') {
          acc.income += amount;
        } else if (normalizedType === 'EXPENSE') {
          acc.expense += amount;
        }

        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + (Number(wallet?.balance) || 0), 0),
    [wallets]
  );

  const spendingChartData = useMemo(() => getLastSevenDaysChartData(transactions), [transactions]);

  const fetchTransactions = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const data = await getTransactions(formatDate(startOfMonth), formatDate(endOfMonth));

      if (Array.isArray(data)) {
        setTransactions(data);
        return;
      }

      if (Array.isArray(data?.transactions)) {
        setTransactions(data.transactions);
        return;
      }

      setTransactions([]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  const fetchWallets = async () => {
    if (typeof onRefreshWallets === 'function') {
      await onRefreshWallets();
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenManualModal = () => {
    setPrefilledData(null);
    setIsModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsModalOpen(false);
    setPrefilledData(null);
  };

  const handleImageCaptured = async (imageBlob) => {
    setIsExtracting(true);
    try {
      const extractedData = await extractInvoice(imageBlob);
      console.log('EXTRACTED INVOICE DATA:', extractedData);

      setPrefilledData(mapExtractedInvoiceToPrefill(extractedData));
      setIsScannerOpen(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('AI processing failed', error);
      alert('Lỗi phân tích hóa đơn, vui lòng nhập thủ công');
      setPrefilledData(null);
      setIsScannerOpen(false);
      setIsModalOpen(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmitTransaction = async (data) => {
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
          type: data.type.toUpperCase(),
          createdAt,
          categoryId: Number(data.category),
          walletId: Number(data.wallet),
        });
      }

      alert('Giao dịch thành công!');
      setIsModalOpen(false);
      setPrefilledData(null);

      await fetchTransactions();
      await fetchWallets();

      if (typeof onRefreshTransactions === 'function') {
        await onRefreshTransactions();
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Tạo giao dịch thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600">Ảnh nhìn nhanh về số dư, giao dịch và xu hướng chi tiêu.</p>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
          >
            <Camera size={16} />
            Quét hoá đơn
          </button>
          
          <button
            type="button"
            onClick={handleOpenManualModal}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            Thêm giao dịch
          </button>
        </div>
      </div>

      <BalanceCard
        balance={formatCurrency(totalBalance)}
        income={`+${formatCurrency(summary.income)}`}
        expense={`-${formatCurrency(summary.expense)}`}
      />

      <RecentTransactions transactions={transactions} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Xu hướng chi tiêu 7 ngày</h3>
          <span className="text-sm text-gray-500">(đơn vị: nghìn đồng)</span>
        </div>
        <div className="h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={spendingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
                formatter={(value) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="spending"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendingGradient)"
                dot={{ r: 3, fill: '#4f46e5', stroke: '#fff', strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TransactionForm
        open={isModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleSubmitTransaction}
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

export default Dashboard;
