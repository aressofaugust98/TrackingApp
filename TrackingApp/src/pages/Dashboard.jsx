import React, { useState } from 'react';
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
import TransactionForm from '../components/TransactionForm';

const chartData = [
  { day: 'T2', spending: 120 },
  { day: 'T3', spending: 90 },
  { day: 'T4', spending: 160 },
  { day: 'T5', spending: 140 },
  { day: 'T6', spending: 200 },
  { day: 'T7', spending: 170 },
  { day: 'CN', spending: 150 },
];

const processReceiptImage = async (imageBlob) => {
  if (!imageBlob) {
    throw new Error('Missing image blob');
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  return {
    type: 'Chi tiêu',
    category: 'Food',
    amount: 150000,
    date: '2026-03-27T20:59',
  };
};

const Dashboard = () => {
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isProcessingImage, setProcessingImage] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);

  const handleOpenManualModal = () => {
    setPrefilledData(null);
    setTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setTransactionModalOpen(false);
    setPrefilledData(null);
  };

  const handleCaptureReceipt = async (blob) => {
    if (!blob) return;

    setScannerOpen(false);
    setProcessingImage(true);

    try {
      const aiResult = await processReceiptImage(blob);
      setProcessingImage(false);
      setPrefilledData(aiResult);
      setTransactionModalOpen(true);
    } catch (error) {
      console.error('Failed to process receipt image:', error);
      setProcessingImage(false);
    }
  };

  const handleSubmitTransaction = (payload) => {
    console.log('Transaction submitted from dashboard:', payload);
    setTransactionModalOpen(false);
    setPrefilledData(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600">Ảnh nhìn nhanh về số dư, giao dịch và xu hướng chi tiêu.</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
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

      <BalanceCard balance="25.430.000₫" income="+12.500.000₫" expense="-3.850.000₫" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Xu hướng chi tiêu 7 ngày</h3>
          <span className="text-sm text-gray-500">(đơn vị: nghìn đồng)</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                formatter={(value) => `${value}k`}
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
        open={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleSubmitTransaction}
        prefilledData={prefilledData}
      />

      {isScannerOpen && (
        <InAppScanner
          onClose={() => setScannerOpen(false)}
          onCapture={handleCaptureReceipt}
        />
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/55 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-gray-900">Đang xử lý ảnh hoá đơn...</p>
            <p className="mt-1 text-xs text-gray-500">AI đang trích xuất số tiền, danh mục và thời gian giao dịch.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
