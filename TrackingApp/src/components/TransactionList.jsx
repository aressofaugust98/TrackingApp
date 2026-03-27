import React, { useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, Pencil, Camera } from 'lucide-react';
import { CATEGORY_STYLES, CATEGORY_FALLBACK } from '../constants/transactionCategories';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatAmount = (transaction) => {
  if (typeof transaction.amount === 'number' && !Number.isNaN(transaction.amount)) {
    const absolute = Math.abs(transaction.amount);
    const formatted = currencyFormatter.format(absolute);
    return transaction.type === 'income' ? `+${formatted}` : `-${formatted}`;
  }
  return transaction.amount || '--';
};

const normalizeToStartOfDay = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateLabel = (transaction) => {
  if (transaction.dateLabel) return transaction.dateLabel;
  const today = normalizeToStartOfDay(new Date());
  const transactionDate = normalizeToStartOfDay(transaction.date || transaction.dateValue);
  if (!today || !transactionDate) return 'Earlier';

  const diffDays = Math.round((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(transactionDate);
};

const getSortTimestamp = (transaction) => {
  const candidate = transaction.date || transaction.dateValue;
  if (!candidate) return 0;
  const timestamp = new Date(candidate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const TransactionList = ({
  transactions = [],
  onAddTransaction,
  onOpenManualForm,
  onOpenScanner,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [groupBy, setGroupBy] = useState('date');
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const groupedTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const sorted = [...transactions];
    if (groupBy === 'date') {
      sorted.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));
    } else {
      sorted.sort((a, b) => (a.category || '').localeCompare(b.category || '', 'vi', { sensitivity: 'base' }));
    }

    const map = new Map();
    sorted.forEach((transaction) => {
      const label = groupBy === 'date' ? getDateLabel(transaction) : transaction.category || 'Khác';
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label).push(transaction);
    });

    return Array.from(map.entries());
  }, [transactions, groupBy]);

  const handleFabClick = () => {
    setIsSpeedDialOpen((prev) => !prev);
  };

  const handleOpenManual = () => {
    setIsSpeedDialOpen(false);
    if (typeof onOpenManualForm === 'function') {
      onOpenManualForm();
      return;
    }
    if (typeof onAddTransaction === 'function') {
      onAddTransaction();
    }
  };

  const handleOpenScanner = () => {
    setIsSpeedDialOpen(false);
    if (typeof onOpenScanner === 'function') {
      onOpenScanner();
    }
  };

  const handleEdit = (transaction) => {
    if (typeof onEditTransaction === 'function') {
      onEditTransaction(transaction);
    }
  };

  const handleDelete = (transaction) => {
    if (typeof onDeleteTransaction === 'function') {
      onDeleteTransaction(transaction);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Transactions</p>
            <h3 className="text-xl font-semibold text-gray-900 mt-1">Recent Activity</h3>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1 text-xs font-medium text-gray-600">
            <span className="hidden sm:inline px-2 tracking-wide uppercase text-[11px] text-gray-500">Phân loại</span>
            {[
              { id: 'date', label: 'Theo ngày' },
              { id: 'category', label: 'Theo danh mục' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGroupBy(option.id)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  groupBy === option.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6" role="list">
          {groupedTransactions.length === 0 && (
            <p className="text-sm text-gray-500">Không có giao dịch nào gần đây.</p>
          )}

          {groupedTransactions.map(([label, items]) => (
            <div key={label} className="space-y-3" role="listitem">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">{label}</p>
              <div className="overflow-hidden rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {items.map((transaction) => {
                  const meta = CATEGORY_STYLES[transaction.category] || CATEGORY_FALLBACK;
                  const Icon = meta.icon;
                  const amountColor = transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600';
                  return (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/90 backdrop-blur-sm px-4 py-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
                          aria-hidden="true"
                        >
                          <Icon size={22} />
                        </span>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-gray-900">{transaction.category}</p>
                          <p className="text-xs text-gray-500 truncate">{transaction.note || 'Không có ghi chú'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                        <div className="text-right min-w-25">
                          <p className={`text-sm font-semibold ${amountColor}`}>{formatAmount(transaction)}</p>
                          {transaction.time && (
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">{transaction.time}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(transaction)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            aria-label="Edit transaction"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(transaction)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 transition-colors"
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-40 flex flex-col items-end gap-3">
        <div
          className={`flex flex-col items-end gap-2 transition-all duration-300 ease-out ${
            isSpeedDialOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleOpenScanner}
            className={`inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-lg ring-1 ring-gray-200 backdrop-blur transition-all duration-300 hover:bg-white ${
              isSpeedDialOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <Camera size={16} className="text-indigo-600" />
            Quét hóa đơn
          </button>
          <button
            type="button"
            onClick={handleOpenManual}
            className={`inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-lg ring-1 ring-gray-200 backdrop-blur transition-all duration-300 delay-75 hover:bg-white ${
              isSpeedDialOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <Pencil size={16} className="text-indigo-600" />
            Nhập thủ công
          </button>
        </div>

        <button
          type="button"
          onClick={handleFabClick}
          aria-label="Toggle transaction actions"
          aria-expanded={isSpeedDialOpen}
          className={`h-14 w-14 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 ${
            isSpeedDialOpen ? 'rotate-45 bg-indigo-500' : 'rotate-0 hover:bg-indigo-500'
          }`}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
