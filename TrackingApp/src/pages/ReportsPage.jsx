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
import {
  getReportByCategory,
  getReportByWallet,
  getReportSummary,
} from '../services/reportService.js';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.round(Math.abs(value)) || 0);

const getCurrentMonthRange = () => {
  const now = new Date();

  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  };
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthStartDate = () => {
  const now = new Date();
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getTodayDate = () => formatDate(new Date());

const normalizeReportType = (value) => (value === 'income' ? 'INCOME' : 'EXPENSE');

const resolveReportItems = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  const arrayCandidates = [
    data?.items,
    data?.data,
    data?.results,
    data?.reports,
    data?.rows,
    data?.breakdown,
    data?.categories,
    data?.wallets,
    data?.summary,
    data?.summary?.items,
    data?.summary?.data,
    data?.summary?.results,
    data?.summary?.reports,
    data?.summary?.rows,
    data?.summary?.breakdown,
  ];

  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (data && typeof data === 'object') {
    const entries = Object.entries(data)
      .filter(([key, value]) => {
        if (['summary', 'data', 'meta', 'pagination', 'pageInfo'].includes(key)) {
          return false;
        }
        return typeof value === 'number' || Array.isArray(value) || (value && typeof value === 'object');
      })
      .map(([key, value]) => {
        if (typeof value === 'number') {
          return { value: key, label: key, total: value, count: 0 };
        }

        if (value && typeof value === 'object') {
          return {
            value: String(value.value ?? value.id ?? key),
            label: String(value.label ?? value.name ?? key),
            ...value,
          };
        }

        return null;
      })
      .filter(Boolean);

    if (entries.length > 0) {
      return entries;
    }
  }

  return [];
};

const resolveReportLabel = (item, groupBy, walletLookup) => {
  if (typeof item?.label === 'string' && item.label.trim()) {
    return item.label;
  }

  if (typeof item?.name === 'string' && item.name.trim()) {
    return item.name;
  }

  if (groupBy === 'wallet') {
    const walletName = walletLookup.get(String(item?.walletId ?? item?.id ?? item?.value ?? ''));
    if (walletName) {
      return walletName;
    }
  }

  if (groupBy === 'category') {
    if (typeof item?.categoryName === 'string' && item.categoryName.trim()) {
      return item.categoryName;
    }
    if (typeof item?.category === 'string' && item.category.trim()) {
      return item.category;
    }
  }

  if (groupBy === 'wallet') {
    if (typeof item?.walletName === 'string' && item.walletName.trim()) {
      return item.walletName;
    }
    if (typeof item?.wallet === 'string' && item.wallet.trim()) {
      return item.wallet;
    }
  }

  return 'Khác';
};

const normalizeReportRows = (data, groupBy, walletLookup) => {
  const items = resolveReportItems(data);

  return items
    .map((item, index) => {
      const value = String(
        item?.value ?? item?.id ?? item?.categoryId ?? item?.walletId ?? item?.name ?? index
      );
      const total = Number(
        item?.totalAmount ?? item?.total ?? item?.amount ?? item?.sum ?? item?.valueAmount ?? 0
      );
      const count = Number(item?.count ?? item?.transactionCount ?? item?.transactionsCount ?? 0);

      return {
        value,
        label: resolveReportLabel(item, groupBy, walletLookup),
        total: Math.abs(Number.isNaN(total) ? 0 : total),
        count: Number.isNaN(count) ? 0 : count,
      };
    })
    .filter((item) => item.label || item.total || item.count);
};

const getSummaryMetric = (summary, typeKey, metricKeys) => {
  const candidates = [
    summary?.[typeKey],
    summary?.[typeKey.toLowerCase()],
    summary?.summary?.[typeKey],
    summary?.summary?.[typeKey.toLowerCase()],
    summary?.data?.[typeKey],
    summary?.data?.[typeKey.toLowerCase()],
    summary?.report?.[typeKey],
    summary?.report?.[typeKey.toLowerCase()],
    summary,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    for (const metricKey of metricKeys) {
      const value = candidate[metricKey];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }

      const parsedValue = Number(value);
      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return null;
};

const normalizeTransactionType = (value) => String(value || '').trim().toUpperCase();

const parseDateInputValue = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isTransactionInRange = (transaction, startDate, endDate) => {
  const parsedDate = transaction?.createdAt ? new Date(String(transaction.createdAt).replace(' ', 'T')) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const start = parseDateInputValue(startDate);
  const end = parseDateInputValue(endDate);

  if (start && parsedDate < start) {
    return false;
  }

  if (end) {
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    if (parsedDate > endOfDay) {
      return false;
    }
  }

  return true;
};

const getTransactionLabel = (transaction, groupBy, walletLookup) => {
  if (groupBy === 'wallet') {
    const walletId = String(transaction?.wallet?.id ?? transaction?.walletId ?? transaction?.wallet ?? '');
    return walletLookup.get(walletId) || transaction?.wallet?.name || 'Ví chưa xác định';
  }

  return transaction?.category?.name || transaction?.category || 'Khác';
};

const buildReportRowsFromTransactions = (transactions, groupBy, walletLookup, type, startDate, endDate) => {
  const map = new Map();

  transactions.forEach((transaction) => {
    const normalizedType = normalizeTransactionType(transaction.type);
    if (normalizedType !== type) {
      return;
    }

    if (!isTransactionInRange(transaction, startDate, endDate)) {
      return;
    }

    const key =
      groupBy === 'wallet'
        ? String(transaction?.wallet?.id ?? transaction?.walletId ?? transaction?.wallet ?? 'unassigned')
        : String(transaction?.category?.id ?? transaction?.categoryId ?? transaction?.category ?? 'Khác');

    const label = getTransactionLabel(transaction, groupBy, walletLookup);

    if (!map.has(key)) {
      map.set(key, {
        value: key,
        label,
        total: 0,
        count: 0,
      });
    }

    const entry = map.get(key);
    entry.total += Math.abs(Number(transaction.amount) || 0);
    entry.count += 1;
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
};

const buildSummaryFromTransactions = (transactions, type, startDate, endDate) => {
  return transactions.reduce(
    (acc, transaction) => {
      const normalizedType = normalizeTransactionType(transaction.type);
      if (normalizedType !== type) {
        return acc;
      }

      if (!isTransactionInRange(transaction, startDate, endDate)) {
        return acc;
      }

      const amount = Math.abs(Number(transaction.amount) || 0);
      acc.totalAmount += amount;
      acc.totalCount += 1;
      return acc;
    },
    { totalAmount: 0, totalCount: 0 }
  );
};

const ReportsPage = ({ wallets = [], transactions = [] }) => {
  const [transactionType, setTransactionType] = useState('expense');
  const [groupBy, setGroupBy] = useState('category');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [startDate, setStartDate] = useState(() => getCurrentMonthStartDate());
  const [endDate, setEndDate] = useState(() => getTodayDate());
  const [reportSummary, setReportSummary] = useState(null);
  const [reportRows, setReportRows] = useState([]);

  const walletLookup = useMemo(() => {
    const map = new Map();
    wallets.forEach((wallet) => {
      map.set(String(wallet.id), wallet.name);
    });
    return map;
  }, [wallets]);

  const fetchReportData = async () => {
    const type = normalizeReportType(transactionType);
    const localRows = buildReportRowsFromTransactions(transactions, groupBy, walletLookup, type, startDate, endDate);
    const localSummary = buildSummaryFromTransactions(transactions, type, startDate, endDate);

    try {
      const [summaryResult, reportResult] = await Promise.allSettled([
        getReportSummary(startDate, endDate),
        groupBy === 'category'
          ? getReportByCategory(type, startDate, endDate)
          : getReportByWallet(type, startDate, endDate),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setReportSummary(summaryResult.value);
      } else {
        setReportSummary({
          [type]: {
            totalAmount: localSummary.totalAmount,
            totalCount: localSummary.totalCount,
          },
        });
      }

      if (reportResult.status === 'fulfilled') {
        const nextRows = normalizeReportRows(reportResult.value, groupBy, walletLookup);
        setReportRows(nextRows.length > 0 ? nextRows : localRows);
      } else {
        setReportRows(localRows);
      }
    } catch (error) {
      console.warn('Falling back to local report data:', error);
      setReportSummary({
        [type]: {
          totalAmount: localSummary.totalAmount,
          totalCount: localSummary.totalCount,
        },
      });
      setReportRows(localRows);
    }
  };

  useEffect(() => {
    setSelectedFilter('all');
  }, [transactionType, groupBy, startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [transactionType, groupBy, startDate, endDate, walletLookup, transactions]);

  const breakdown = useMemo(() => {
    return [...reportRows].sort((a, b) => b.total - a.total);
  }, [reportRows]);

  useEffect(() => {
    if (selectedFilter === 'all') return;
    const stillExists = breakdown.some((item) => item.value === selectedFilter);
    if (!stillExists) {
      setSelectedFilter('all');
    }
  }, [breakdown, selectedFilter]);

  const totalAmount = useMemo(
    () =>
      getSummaryMetric(reportSummary, normalizeReportType(transactionType), [
        'totalAmount',
        'amount',
        'totalAmountValue',
        'amountTotal',
        'total',
        'value',
        'sum',
      ]) ?? breakdown.reduce((sum, item) => sum + Math.abs(Number(item.total) || 0), 0),
    [breakdown, reportSummary, transactionType]
  );

  const totalCount = useMemo(
    () =>
      getSummaryMetric(reportSummary, normalizeReportType(transactionType), [
        'totalCount',
        'count',
        'countTotal',
        'transactionTotal',
        'transactionCount',
        'transactionsCount',
        'totalTransactions',
      ]) ?? breakdown.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
    [breakdown, reportSummary, transactionType]
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return { length: totalCount };

    const selectedGroup = breakdown.find((item) => item.value === selectedFilter);
    return { length: selectedGroup ? selectedGroup.count : 0 };
  }, [breakdown, selectedFilter, totalCount]);

  const highlightedGroup = selectedFilter === 'all'
    ? breakdown[0] || null
    : breakdown.find((item) => item.value === selectedFilter) || null;

  const chartData = useMemo(
    () =>
      breakdown.slice(0, 6).map((item) => ({
        name: item.label,
        total: Math.round(item.total),
      })),
    [breakdown]
  );

  const filterOptions = useMemo(
    () => breakdown.map((item) => ({ value: item.value, label: item.label })),
    [breakdown]
  );

  const emptyState = breakdown.length === 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600">Báo cáo</p>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê giao dịch thông minh</h1>
          <p className="text-gray-600">
            Theo dõi hiệu quả chi tiêu và thu nhập theo từng danh mục hoặc ví tiền. Chọn phạm vi mong muốn để xem xu hướng.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 max-w-2xl">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Từ ngày
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Đến ngày
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </label>
          </div>
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
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
