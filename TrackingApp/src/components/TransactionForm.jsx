import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../constants/transactionCategories';

const createDefaultValues = () => {
  const now = new Date();
  return {
    type: 'expense',
    category: CATEGORY_OPTIONS[0]?.value || 'Food',
    amount: '',
    note: '',
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
  };
};

const normalizeType = (typeValue) => {
  if (!typeValue) return 'expense';
  if (typeValue === 'income' || typeValue === 'expense') return typeValue;

  const normalized = String(typeValue).trim().toLowerCase();
  if (normalized === 'chi tiêu' || normalized === 'chi tieu' || normalized === 'expense') {
    return 'expense';
  }
  if (normalized === 'thu nhập' || normalized === 'thu nhap' || normalized === 'income') {
    return 'income';
  }

  return 'expense';
};

const buildInitialValues = (data) => {
  const defaults = createDefaultValues();
  if (!data) return defaults;

  const parsedDate = data.date ? new Date(data.date) : null;
  const hasValidDate = parsedDate instanceof Date && !Number.isNaN(parsedDate?.getTime?.());
  const resolvedDate = hasValidDate ? parsedDate.toISOString().slice(0, 10) : defaults.date;
  const resolvedTime =
    data.time ||
    (typeof data.date === 'string' && data.date.includes('T') ? data.date.slice(11, 16) : '') ||
    defaults.time;

  return {
    type: normalizeType(data.type),
    category: data.category || CATEGORY_OPTIONS[0]?.value || 'Food',
    amount: typeof data.amount === 'number' ? String(Math.abs(data.amount)) : data.amount || '',
    note: data.note || '',
    date: resolvedDate,
    time: resolvedTime,
  };
};

const TransactionForm = ({ open, onClose, onSubmit, initialData, prefilledData = null }) => {
  const [values, setValues] = useState(createDefaultValues());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const sourceData = prefilledData || initialData;
    setValues(buildInitialValues(sourceData));
    setError('');
  }, [open, initialData, prefilledData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.amount) {
      setError('Vui lòng nhập số tiền');
      return;
    }
    const parsedAmount = Number(values.amount.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    const payload = {
      type: values.type,
      category: values.category,
      amount: parsedAmount,
      note: values.note.trim(),
      date: values.date,
      time: values.time,
    };

    if (typeof onSubmit === 'function') {
      onSubmit(payload);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">{initialData ? 'Cập nhật' : 'Thêm mới'}</p>
            <h3 className="text-xl font-semibold text-gray-900 mt-1">Giao dịch</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-900"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Loại giao dịch
              <select
                name="type"
                value={values.type}
                onChange={handleChange}
                className="w-full rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Danh mục
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className="w-full rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Số tiền
              <input
                type="number"
                name="amount"
                min="0"
                step="1000"
                value={values.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ví dụ: 500000"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Ngày giao dịch
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  className="rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="time"
                  name="time"
                  value={values.time}
                  onChange={handleChange}
                  className="rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Ghi chú
            <textarea
              name="note"
              value={values.note}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 resize-none"
              rows="3"
              placeholder="Thêm ghi chú cho giao dịch này..."
            />
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-2xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
            >
              {initialData ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
