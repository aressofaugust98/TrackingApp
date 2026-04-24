import React, { useMemo, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const DEFAULT_BUDGET_ITEMS = [
  { id: 'budget-1', categoryName: 'Ăn uống', amount: 3000000, totalSpent: 1850000, month: '2026-04' },
  { id: 'budget-2', categoryName: 'Giải trí', amount: 1500000, totalSpent: 1280000, month: '2026-04' },
  { id: 'budget-3', categoryName: 'Di chuyển', amount: 1000000, totalSpent: 1040000, month: '2026-04' },
];

const STATUS_STYLE = {
  SAFE: {
    label: 'SAFE',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'from-emerald-400 to-emerald-600',
    text: 'text-emerald-700',
  },
  WARNING: {
    label: 'WARNING',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'from-amber-400 to-amber-500',
    text: 'text-amber-700',
  },
  OVER: {
    label: 'OVER',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'from-rose-400 to-rose-600',
    text: 'text-rose-700',
  },
};

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthLabel = (monthValue) => {
  if (!monthValue) return '';

  const [year, month] = monthValue.split('-').map((value) => Number(value));
  if (!year || !month) return monthValue;

  return `Tháng ${month}/${year}`;
};

const formatCurrency = (value) => currencyFormatter.format(Math.round(Number(value) || 0));

const getUsagePercent = (totalSpent, amount) => {
  const normalizedAmount = Number(amount) || 0;
  const normalizedSpent = Number(totalSpent) || 0;

  if (normalizedAmount <= 0) {
    return normalizedSpent > 0 ? 100 : 0;
  }

  return (normalizedSpent / normalizedAmount) * 100;
};

const getBudgetStatus = (percent) => {
  if (percent < 80) return 'SAFE';
  if (percent < 100) return 'WARNING';
  return 'OVER';
};

const BudgetPage = ({ initialBudgets = DEFAULT_BUDGET_ITEMS }) => {
  const initialMonth = getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [budgetItems, setBudgetItems] = useState(
    Array.isArray(initialBudgets) && initialBudgets.length > 0 ? initialBudgets : DEFAULT_BUDGET_ITEMS
  );
  const [budgetByMonth, setBudgetByMonth] = useState(() => ({
    [initialMonth]: (Array.isArray(initialBudgets) && initialBudgets.length > 0 ? initialBudgets : DEFAULT_BUDGET_ITEMS)
      .filter((item) => (item.month || initialMonth) === initialMonth)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  }));
  const [totalBudgetInput, setTotalBudgetInput] = useState(String(budgetByMonth[initialMonth] || 0));
  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    amount: '',
    totalSpent: '',
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const computedItems = useMemo(() => {
    return budgetItems.map((item) => {
      const percent = getUsagePercent(item.totalSpent, item.amount);
      const status = getBudgetStatus(percent);

      return {
        ...item,
        percent,
        status,
      };
    });
  }, [budgetItems]);

  const filteredItems = useMemo(
    () => computedItems.filter((item) => (item.month || initialMonth) === selectedMonth),
    [computedItems, selectedMonth, initialMonth]
  );

  const selectedMonthBudget = Number(budgetByMonth[selectedMonth]) || 0;
  const selectedMonthSpent = useMemo(
    () => filteredItems.reduce((sum, item) => sum + (Number(item.totalSpent) || 0), 0),
    [filteredItems]
  );
  const selectedMonthPercent = getUsagePercent(selectedMonthSpent, selectedMonthBudget);
  const selectedMonthStatus = getBudgetStatus(selectedMonthPercent);
  const selectedMonthStatusStyle = STATUS_STYLE[selectedMonthStatus];

  const totalSpentAll = useMemo(
    () => computedItems.reduce((sum, item) => sum + (Number(item.totalSpent) || 0), 0),
    [computedItems]
  );
  const totalBudgetAll = useMemo(
    () => Object.values(budgetByMonth).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [budgetByMonth]
  );
  const overallPercent = getUsagePercent(totalSpentAll, totalBudgetAll);
  const overallStatus = getBudgetStatus(overallPercent);
  const overallStatusStyle = STATUS_STYLE[overallStatus];

  const handleChangeSelectedMonth = (event) => {
    const nextMonth = String(event.target.value || '').slice(0, 7);
    setSelectedMonth(nextMonth);
    setTotalBudgetInput(String(budgetByMonth[nextMonth] ?? 0));
  };

  const handleChangeCategoryForm = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCategory = (event) => {
    event.preventDefault();

    const categoryName = categoryForm.categoryName.trim();
    const amount = Number(categoryForm.amount);
    const totalSpent = Number(categoryForm.totalSpent);

    if (!categoryName) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Ngân sách danh mục phải lớn hơn 0.');
      return;
    }

    if (!Number.isFinite(totalSpent) || totalSpent < 0) {
      alert('Số tiền đã chi phải lớn hơn hoặc bằng 0.');
      return;
    }

    const newItem = {
      id: `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      categoryName,
      amount: Math.round(amount),
      totalSpent: Math.round(totalSpent),
      month: selectedMonth,
    };

    setBudgetItems((prev) => [...prev, newItem]);
    setBudgetByMonth((prev) => ({
      ...prev,
      [selectedMonth]: (Number(prev[selectedMonth]) || 0) + Math.round(amount),
    }));
    setCategoryForm({ categoryName: '', amount: '', totalSpent: '' });
  };

  const handleSubmitTotalBudget = (event) => {
    event.preventDefault();

    const parsed = Number(totalBudgetInput);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      alert('Tổng ngân sách phải lớn hơn 0.');
      return;
    }

    setBudgetByMonth((prev) => ({
      ...prev,
      [selectedMonth]: Math.round(parsed),
    }));
  };

  const handleStartEditCategory = (item) => {
    setEditingCategoryId(item.id);
    setEditingCategoryName(item.categoryName);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleSaveCategoryName = (itemId) => {
    const nextName = editingCategoryName.trim();

    if (!nextName) {
      alert('Tên danh mục không được để trống.');
      return;
    }

    setBudgetItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, categoryName: nextName } : item)));
    handleCancelEditCategory();
  };

  const handleDeleteCategory = (itemId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa danh mục này không?');
    if (!confirmed) return;

    setBudgetItems((prev) => prev.filter((item) => item.id !== itemId));
    handleCancelEditCategory();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600">Ngân sách</p>
          <h1 className="text-3xl font-bold text-gray-900">Theo dõi kế hoạch chi tiêu</h1>
          <p className="text-gray-600">Quản lý ngân sách theo tháng, theo danh mục và theo trạng thái chi tiêu.</p>
        </div>

    
          <div className="flex w-full flex-col gap-2 sm:max-w-xs">
            <input
              id="selectedMonth"
              type="month"
              value={`${selectedMonth}`}
              onChange={handleChangeSelectedMonth}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none ring-indigo-500 transition focus:ring-2"
            />
          </div>
        

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Ngân sách {getMonthLabel(selectedMonth)}</p>
                <p className="text-xs text-gray-400">Tổng tiền đã chi so với ngân sách của tháng đang chọn</p>
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${selectedMonthStatusStyle.badge}`}>
                {selectedMonthStatusStyle.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedMonthSpent)}</p>
              <p className="text-sm text-gray-500">/ {formatCurrency(selectedMonthBudget)}</p>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${selectedMonthStatusStyle.bar} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(100, selectedMonthPercent)}%` }}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className={`text-sm font-semibold ${selectedMonthStatusStyle.text}`}>{selectedMonthPercent.toFixed(1)}% đã sử dụng</p>
              <p className="text-sm text-gray-500">{filteredItems.length} danh mục trong tháng</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTotalBudget} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Form tổng ngân sách theo tháng</h2>
            <p className="mt-1 text-xs text-gray-500">Cập nhật ngân sách cho tháng đang được lọc.</p>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="overallBudget">
              Tổng ngân sách (VND)
            </label>
            <input
              id="overallBudget"
              type="number"
              min="1"
              step="1000"
              value={totalBudgetInput}
              onChange={(event) => setTotalBudgetInput(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="Ví dụ: 7000000"
            />

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              Cập nhật ngân sách tháng này
            </button>
          </form>
        </div>

        <form onSubmit={handleSubmitCategory} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Form danh mục muốn chi tiêu</h2>
          <p className="mt-1 text-sm text-gray-500">Thêm danh mục mới cho tháng đang chọn.</p>
          <p className="mt-1 text-xs text-gray-400">Danh mục mới sẽ được gắn vào {getMonthLabel(selectedMonth)}.</p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              name="categoryName"
              type="text"
              value={categoryForm.categoryName}
              onChange={handleChangeCategoryForm}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="Tên danh mục (vd: Ăn uống)"
            />
            <input
              name="amount"
              type="number"
              min="1"
              step="1000"
              value={categoryForm.amount}
              onChange={handleChangeCategoryForm}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="Tổng ngân sách"
            />
            <input
              name="totalSpent"
              type="number"
              min="0"
              step="1000"
              value={categoryForm.totalSpent}
              onChange={handleChangeCategoryForm}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="Số tiền đã chi"
            />
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Thêm danh mục
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Tổng quan chi tiêu theo danh mục</h2>
                <p className="mt-1 text-sm text-gray-500">Hiển thị những danh mục có phát sinh trong {getMonthLabel(selectedMonth)}.</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">Ngân sách tháng</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedMonthBudget)}</p>
              </div>
            </div>
          </div>

          {filteredItems.map((item) => {
            const style = STATUS_STYLE[item.status];
            const isEditing = editingCategoryId === item.id;

            return (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(event) => setEditingCategoryName(event.target.value)}
                        className="w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-lg font-semibold text-gray-900 outline-none ring-indigo-500 transition focus:ring-2"
                        placeholder="Nhập tên danh mục"
                        autoFocus
                      />
                    ) : (
                      <h3 className="truncate text-lg font-semibold text-gray-900">{item.categoryName}</h3>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}>
                      {style.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(item.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                      aria-label="Xóa danh mục"
                      title="Xóa danh mục"
                    >
                      <Trash2 size={15} />
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryName(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                          aria-label="Lưu tên danh mục"
                          title="Lưu"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditCategory}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
                          aria-label="Huỷ sửa tên danh mục"
                          title="Huỷ"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditCategory(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
                        aria-label="Sửa tên danh mục"
                        title="Sửa tên danh mục"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{formatCurrency(item.totalSpent)}</span>
                  {' / '}
                  <span>{formatCurrency(item.amount)}</span>
                </p>

                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>

                <p className={`mt-2 text-sm font-semibold ${style.text}`}>{item.percent.toFixed(1)}% đã sử dụng</p>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Chưa có danh mục nào trong tháng này</p>
              <p className="mt-1 text-sm text-gray-500">Hãy thêm danh mục mới hoặc đổi tháng để xem dữ liệu.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Tổng quan toàn bộ</p>
          <p className="mt-2 text-sm text-gray-600">
            Tổng chi tiêu: <span className="font-semibold text-gray-900">{formatCurrency(totalSpentAll)}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Tổng ngân sách: <span className="font-semibold text-gray-900">{formatCurrency(totalBudgetAll)}</span>
          </p>
          <p className={`mt-2 text-sm font-semibold ${overallStatusStyle.text}`}>
            Trạng thái chung: {overallStatusStyle.label} ({overallPercent.toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;