import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RecentTransactions = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
        <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer">Xem tất cả</span>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  item.type === 'income'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {item.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold ${
                item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
