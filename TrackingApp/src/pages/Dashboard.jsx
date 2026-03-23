import React from 'react';
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

const chartData = [
  { day: 'T2', spending: 120 },
  { day: 'T3', spending: 90 },
  { day: 'T4', spending: 160 },
  { day: 'T5', spending: 140 },
  { day: 'T6', spending: 200 },
  { day: 'T7', spending: 170 },
  { day: 'CN', spending: 150 },
];

const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600">Ảnh nhìn nhanh về số dư, giao dịch và xu hướng chi tiêu.</p>
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
    </div>
  );
};

export default Dashboard;
