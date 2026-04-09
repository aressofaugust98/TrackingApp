import React, { useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, Pencil, Camera, CalendarRange, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { CATEGORY_STYLES, CATEGORY_FALLBACK } from '../constants/transactionCategories';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const getNormalizedType = (transaction) => String(transaction?.type || '').toUpperCase();

const getCategoryName = (transaction) => {
  if (typeof transaction?.category === 'string') {
    return transaction.category;
  }
  return transaction?.category?.name || 'Danh mục';
};

const isTransferTransaction = (transaction) => getNormalizedType(transaction) === 'TRANSFER';

const getWalletDisplayName = (wallet, fallback = '') => {
  if (typeof wallet === 'string') {
    return wallet.trim() || fallback;
  }

  if (typeof wallet === 'number') {
    return String(wallet);
  }

  return wallet?.name || fallback;
};

const getTransferTitle = (transaction) => {
  const sourceWallet =
    getWalletDisplayName(transaction?.sourceWallet, '') ||
    getWalletDisplayName(transaction?.wallet, '');
  const destinationWallet = getWalletDisplayName(transaction?.destinationWallet, '');

  if (sourceWallet && destinationWallet) {
    return `${sourceWallet} ➔ ${destinationWallet}`;
  }

  return 'Chuyển tiền';
};

const getTransferSubtitle = (transaction) => {
  const sourceWallet =
    getWalletDisplayName(transaction?.sourceWallet, '') ||
    getWalletDisplayName(transaction?.wallet, '');
  const destinationWallet = getWalletDisplayName(transaction?.destinationWallet, '');

  if (sourceWallet && destinationWallet) {
    return `Từ ví ${sourceWallet} sang ví ${destinationWallet}`;
  }

  return 'Transfer';
};

const getWalletName = (transaction) => {
  const sourceWallet = transaction?.wallet?.name;
  const destinationWallet = transaction?.destinationWallet?.name;

  if (getNormalizedType(transaction) === 'TRANSFER' && sourceWallet && destinationWallet) {
    return `${sourceWallet} -> ${destinationWallet}`;
  }

  return sourceWallet || destinationWallet || '';
};

const getTransactionDate = (transaction) => {
  const candidate = transaction?.createdAt || transaction?.date || transaction?.dateValue || transaction?.transactionDate || transaction?.timestamp;
  if (!candidate) {
    console.warn('Transaction missing date field:', transaction);
    return null;
  }
  const normalized = `${String(candidate).trim().replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    console.warn('Failed to parse date:', candidate, 'for transaction:', transaction);
    return null;
  }
  return date;
};

const getTransactionTimeLabel = (transaction) => {
  const date = getTransactionDate(transaction);
  if (!date) return transaction?.time || '';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatAmount = (transaction) => {
  if (typeof transaction.amount === 'number' && !Number.isNaN(transaction.amount)) {
    const absolute = Math.abs(transaction.amount);
    const formatted = currencyFormatter.format(absolute);
    if (isTransferTransaction(transaction)) {
      return formatted;
    }
    return getNormalizedType(transaction) === 'INCOME' ? `+${formatted}` : `-${formatted}`;
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
  const transactionDate = normalizeToStartOfDay(getTransactionDate(transaction));
  if (!today || !transactionDate) return 'Earlier';

  const diffDays = Math.round((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
  }).format(transactionDate);
};

const getSortTimestamp = (transaction) => {
  const date = getTransactionDate(transaction);
  if (!date) return 0;
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getEndOfDay = (value) => {
  const date = normalizeToStartOfDay(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

const RANGE_OPTIONS = [
  { id: 'thisMonth', label: 'Tháng này' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'yesterday', label: 'Hôm qua' },
  { id: 'thisWeek', label: 'Tuần này' },
  { id: 'lastWeek', label: 'Tuần trước' },
  { id: 'custom', label: 'Tùy chọn' },
];

const getRangeBounds = (rangeId, customRange = null) => {
  const todayStart = normalizeToStartOfDay(new Date());
  const todayEnd = getEndOfDay(new Date());

  switch (rangeId) {
    case 'today':
      return { start: todayStart, end: todayEnd };
    case 'yesterday': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 1);
      return { start, end: getEndOfDay(start) };
    }
    case 'thisWeek': {
      const currentDay = todayStart.getDay() === 0 ? 7 : todayStart.getDay();
      const start = new Date(todayStart);
      start.setDate(start.getDate() - (currentDay - 1));
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end: getEndOfDay(end) };
    }
    case 'lastWeek': {
      const currentDay = todayStart.getDay() === 0 ? 7 : todayStart.getDay();
      const thisWeekStart = new Date(todayStart);
      thisWeekStart.setDate(thisWeekStart.getDate() - (currentDay - 1));
      const start = new Date(thisWeekStart);
      start.setDate(start.getDate() - 7);
      const end = new Date(thisWeekStart);
      end.setDate(end.getDate() - 1);
      return { start, end: getEndOfDay(end) };
    }
    case 'thisMonth': {
      const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
      const end = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0);
      return { start: normalizeToStartOfDay(start), end: getEndOfDay(end) };
    }
    case 'custom': {
      if (!customRange || !customRange.start || !customRange.end) return null;
      const start = normalizeToStartOfDay(customRange.start);
      const end = getEndOfDay(customRange.end);
      if (!start || !end || start > end) return null;
      return { start, end };
    }
    default:
      return null;
  }
};

const filterTransactionsByRange = (transactions, rangeId, customRange) => {
  const bounds = getRangeBounds(rangeId, customRange);
  if (!bounds) return [...transactions];

  return transactions.filter((transaction) => {
    const timestamp = getTransactionDate(transaction);
    // If timestamp is null, include the transaction anyway (it might be missing date data)
    if (!timestamp) return true;
    if (Number.isNaN(timestamp.getTime())) return true;
    return timestamp >= bounds.start && timestamp <= bounds.end;
  });
};

const TransactionList = ({
  transactions,
  onAddTransaction,
  onOpenManualForm,
  onOpenScanner,
  onEdit,
  onDelete,
}) => {
  const transactionItems = Array.isArray(transactions) ? transactions : [];
  const [selectedRange, setSelectedRange] = useState('thisMonth');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const customRangeError =
    selectedRange === 'custom' &&
    customRange.start &&
    customRange.end &&
    new Date(customRange.start) > new Date(customRange.end);

  const shouldApplyCustomRange =
    selectedRange === 'custom' &&
    customRange.start &&
    customRange.end &&
    !customRangeError;

  const rangeFilteredTransactions = useMemo(() => {
    if (selectedRange === 'custom' && !shouldApplyCustomRange) {
      return [];
    }
    return filterTransactionsByRange(transactionItems, selectedRange, shouldApplyCustomRange ? customRange : null);
  }, [transactionItems, selectedRange, customRange, shouldApplyCustomRange]);

  const groupedTransactions = useMemo(() => {
    if (!rangeFilteredTransactions.length) return [];

    const sorted = [...rangeFilteredTransactions];
    sorted.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));

    const map = new Map();
    sorted.forEach((transaction) => {
      const label = getDateLabel(transaction);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label).push(transaction);
    });

    return Array.from(map.entries());
  }, [rangeFilteredTransactions]);

  const selectedRangeMeta = RANGE_OPTIONS.find((option) => option.id === selectedRange);
  const showFallbackState = transactionItems.length === 0;

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
    if (typeof onEdit === 'function') {
      onEdit(transaction);
    }
  };

  const handleDelete = (transaction) => {
    if (typeof onDelete === 'function') {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Transactions</p>
            <h3 className="text-xl font-semibold text-gray-900 mt-1">Recent Activity</h3>
            <p className="text-xs text-gray-500 mt-1">
              Hiển thị {selectedRangeMeta ? selectedRangeMeta.label.toLowerCase() : 'mọi giao dịch'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">
              Khoảng thời gian
            </span>
            <div className="relative">
              <CalendarRange size={16} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedRange}
                onChange={(event) => setSelectedRange(event.target.value)}
                className="appearance-none rounded-full border border-gray-200 bg-white pl-9 pr-9 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {selectedRange === 'custom' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Từ ngày
              <input
                type="date"
                value={customRange.start}
                onChange={(event) => setCustomRange((prev) => ({ ...prev, start: event.target.value }))}
                className="mt-2 h-11 rounded-2xl border border-gray-200 px-3 text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Đến ngày
              <input
                type="date"
                value={customRange.end}
                onChange={(event) => setCustomRange((prev) => ({ ...prev, end: event.target.value }))}
                className="mt-2 h-11 rounded-2xl border border-gray-200 px-3 text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            {customRangeError && (
              <p className="sm:col-span-2 text-xs text-rose-600">
                Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.
              </p>
            )}
            {!customRangeError && (!customRange.start || !customRange.end) && (
              <p className="sm:col-span-2 text-xs text-gray-500">
                Chọn đầy đủ ngày bắt đầu và kết thúc để áp dụng bộ lọc.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 space-y-6" role="list">
          {showFallbackState && <div className="text-center py-8 text-gray-500">Chưa có giao dịch nào</div>}

          {!showFallbackState && groupedTransactions.map(([label, items]) => (
            <div key={label} className="space-y-3" role="listitem">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">{label}</p>
              <div className="overflow-hidden rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {items.map((transaction) => {
                  const transferTransaction = isTransferTransaction(transaction);
                  const categoryName = getCategoryName(transaction);
                  const walletName = getWalletName(transaction);
                  const detailLabel = [walletName, transaction.note].filter(Boolean).join(' • ');
                  const meta = CATEGORY_STYLES[categoryName] || CATEGORY_FALLBACK;
                  const Icon = transferTransaction ? ArrowLeftRight : meta.icon;
                  const amountColor = transferTransaction
                    ? 'text-gray-900'
                    : getNormalizedType(transaction) === 'INCOME'
                      ? 'text-emerald-600'
                      : 'text-rose-600';
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
                          <p className="text-sm font-semibold text-gray-900">
                            {transferTransaction ? getTransferTitle(transaction) : transaction.category?.name || categoryName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {transferTransaction ? getTransferSubtitle(transaction) : detailLabel || 'Không có ghi chú'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                        <div className="text-right min-w-25">
                          <p className={`text-sm font-semibold ${amountColor}`}>{formatAmount(transaction)}</p>
                          {getTransactionTimeLabel(transaction) && (
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">{getTransactionTimeLabel(transaction)}</p>
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

      <div className="fixed z-40 bottom-40 right-4 md:bottom-26 md:right-10 flex flex-col items-end gap-3">
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
