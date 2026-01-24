import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const BalanceCard = ({ balance, income, expense }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-sm text-indigo-100">Tổng số dư</p>
        <h2 className="text-3xl font-bold mt-2">{balance}</h2>
        <p className="text-indigo-100 mt-3 text-sm">Cập nhật gần đây</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Thu nhập</p>
            <p className="text-lg font-semibold text-emerald-600 mt-1">{income}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Chi tiêu</p>
            <p className="text-lg font-semibold text-rose-600 mt-1">{expense}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
