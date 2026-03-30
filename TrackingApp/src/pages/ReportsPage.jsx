import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.round(Math.abs(value)) || 0);

const ReportsPage = ({ transactions = [], wallets = [] }) => {
  const [transactionType, setTransactionType] = useState('expense');
  const [groupBy, setGroupBy] = useState('category');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const walletLookup = useMemo(() => {
    const map = new Map();
    wallets.forEach((wallet) => {
      map.set(wallet.id, wallet.name);
    });
    return map;
  }, [wallets]);

  useEffect(() => {
    setSelectedFilter('all');
  }, [transactionType, groupBy]);

  const filteredByType = useMemo(
    () => transactions.filter((transaction) => transaction.type === transactionType),
    [transactions, transactionType]
  );

  const breakdown = useMemo(() => {
    const map = new Map();

    filteredByType.forEach((transaction) => {
      const valueKey = groupBy === 'category' ? transaction.category || 'Khác' : transaction.wallet || 'unassigned';
      const label =
        groupBy === 'category'
          ? transaction.category || 'Khác'
          : walletLookup.get(transaction.wallet) || 'Ví chưa xác định';

      if (!map.has(valueKey)) {
        map.set(valueKey, {
          value: valueKey,
          label,
          total: 0,
          count: 0,
        });
      }

      const entry = map.get(valueKey);
      entry.total += Math.abs(transaction.amount || 0);
      entry.count += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredByType, groupBy, walletLookup]);

  useEffect(() => {
    if (selectedFilter === 'all') return;
    const stillExists = breakdown.some((item) => item.value === selectedFilter);
    if (!stillExists) {
      setSelectedFilter('all');
    }
  }, [breakdown, selectedFilter]);

  const totalAmount = useMemo(
    () => filteredByType.reduce((sum, transaction) => sum + Math.abs(transaction.amount || 0), 0),
    [filteredByType]
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return filteredByType;
    return filteredByType.filter((transaction) => {
      const key = groupBy === 'category' ? transaction.category || 'Khác' : transaction.wallet || 'unassigned';
      return key === selectedFilter;
    });
  }, [filteredByType, selectedFilter, groupBy]);

  const highlightedGroup = selectedFilter === 'all'
    ? breakdown[0] || null
    : breakdown.find((item) => item.value === selectedFilter) || null;

  const chartData = breakdown.slice(0, 6).map((item) => ({
    name: item.label,
    total: Math.round(item.total),
  }));

  const filterOptions = breakdown.map((item) => ({ value: item.value, label: item.label }));

  const emptyState = filteredByType.length === 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600">Báo cáo</p>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê giao dịch thông minh</h1>
          <p className="text-gray-600">
            Theo dõi hiệu quả chi tiêu và thu nhập theo từng danh mục hoặc ví tiền. Chọn phạm vi mong muốn để xem xu hướng.
          </p>
        </header>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Loại giao dịch</p>
              <div className="mt-3 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                {[
                  { id: 'expense', label: 'Chi tiêu' },
                  { id: 'income', label: 'Thu nhập' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTransactionType(option.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                      transactionType === option.id
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Kiểu thống kê</p>
              <div className="mt-3 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                {[
                  { id: 'category', label: 'Theo danh mục' },
                  { id: 'wallet', label: 'Theo ví tiền' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGroupBy(option.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                      groupBy === option.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Lọc chi tiết</p>
              <select
                value={selectedFilter}
                onChange={(event) => setSelectedFilter(event.target.value)}
                disabled={breakdown.length === 0}
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed"
              >
                <option value="all">Tất cả {groupBy === 'category' ? 'danh mục' : 'ví tiền'}</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng {transactionType === 'expense' ? 'chi tiêu' : 'thu nhập'}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Số giao dịch</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{filteredTransactions.length}</p>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Nhóm dẫn đầu</p>
            {highlightedGroup ? (
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-900">{highlightedGroup.label}</p>
                <p className="text-sm text-indigo-600">{formatCurrency(highlightedGroup.total)}</p>
              </div>
            ) : (
              <p className="mt-2 text-lg font-semibold text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Biểu đồ</p>
              <h3 className="text-xl font-semibold text-gray-900">Phân bổ theo {groupBy === 'category' ? 'danh mục' : 'ví tiền'}</h3>
            </div>
            {chartData.length > 0 && (
              <p className="text-sm text-gray-500">Top {chartData.length} nhóm nổi bật</p>
            )}
          </div>

          {emptyState ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Chưa có giao dịch phù hợp để hiển thị biểu đồ.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" fill="url(#reportBar)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Chi tiết</p>
              <h3 className="text-xl font-semibold text-gray-900">Bảng thống kê</h3>
            </div>
            <p className="text-sm text-gray-500">Tổng cộng {breakdown.length} nhóm</p>
          </div>

          {emptyState ? (
            <p className="text-sm text-gray-500">Không có giao dịch nào trong phạm vi đã chọn.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400">
                    <th className="py-3 pr-4 font-semibold">Nhóm</th>
                    <th className="py-3 pr-4 font-semibold">Số giao dịch</th>
                    <th className="py-3 pr-4 font-semibold">Tổng tiền</th>
                    <th className="py-3 pr-4 font-semibold">Tỷ trọng</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item) => {
                    const share = totalAmount ? (item.total / totalAmount) * 100 : 0;
                    const isActive = selectedFilter === item.value || (selectedFilter === 'all' && breakdown[0]?.value === item.value);
                    return (
                      <tr key={item.value} className={`border-t border-gray-100 ${isActive ? 'bg-indigo-50/40' : ''}`}>
                        <td className="py-3 pr-4 font-medium text-gray-900">{item.label}</td>
                        <td className="py-3 pr-4 text-gray-600">{item.count}</td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                        <td className="py-3 pr-4 text-gray-600">{share.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportsPage;
