import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const getNormalizedType = (transaction) => String(transaction?.type || '').toUpperCase();

const getCategoryName = (transaction) => {
  if (typeof transaction?.category === 'string') {
    return transaction.category;
  }
  return transaction?.category?.name || 'Giao dịch';
};

const formatDateLabel = (createdAt) => {
  if (!createdAt) return '--';
  const normalized = String(createdAt).replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(createdAt);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = (transaction) => {
  const amount = Number(transaction?.amount || 0);
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return getNormalizedType(transaction) === 'INCOME' ? `+${formatted}` : `-${formatted}`;
};

const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center text-gray-500 py-4">Chưa có giao dịch nào</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
        <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer">Xem tất cả</span>
      </div>
      <div className="space-y-4">
        {transactions.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  getNormalizedType(item) === 'INCOME'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {getNormalizedType(item) === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{getCategoryName(item)}</p>
                <p className="text-xs text-gray-500">{item.wallet?.name || formatDateLabel(item.createdAt)}</p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold ${
                getNormalizedType(item) === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatAmount(item)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
