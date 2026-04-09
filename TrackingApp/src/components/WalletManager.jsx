import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Edit2, Plus, Trash2, Wallet } from 'lucide-react';
import { createWallet, deleteWallet, updateWallet } from '../services/walletService';

const formatVND = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('₫', '₫')
    .trim();
};

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const normalizeTransactionType = (value) => String(value || '').trim().toUpperCase();

const getTransferDate = (transaction) => {
  const candidate = transaction?.createdAt || transaction?.date || transaction?.dateValue;
  if (!candidate) return null;

  const normalized = `${String(candidate).trim().replace(' ', 'T')}Z`;
  const parsedDate = new Date(normalized);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatTransferDateTime = (transaction) => {
  const parsedDate = getTransferDate(transaction);
  if (!parsedDate) {
    return transaction?.time || '';
  }

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);

  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsedDate);

  return `${formattedDate} • ${formattedTime}`;
};

const getTransferWalletName = (wallet, fallback) => {
  if (typeof wallet === 'string') {
    return wallet.trim() || fallback;
  }

  if (typeof wallet === 'number') {
    return String(wallet);
  }

  return wallet?.name || fallback;
};

const getTransferRouteLabel = (transaction) => {
  const sourceWallet =
    transaction?.sourceWallet?.name ||
    transaction?.wallet?.name ||
    transaction?.sourceWalletName ||
    transaction?.fromWalletName ||
    getTransferWalletName(transaction?.sourceWallet, 'Ví nguồn');

  const destinationWallet =
    transaction?.destinationWallet?.name ||
    transaction?.destinationWalletName ||
    transaction?.toWalletName ||
    getTransferWalletName(transaction?.destinationWallet, 'Ví đích');

  return `${sourceWallet} ➔ ${destinationWallet}`;
};

const isTransferTransaction = (transaction) => {
  const normalizedType = normalizeTransactionType(transaction?.type);
  return normalizedType === 'TRANSFER' || transaction?.destinationWallet != null || transaction?.sourceWallet != null;
};

const WalletManager = ({ wallets = [], transactions = [], onRefreshWallets }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên ví');
      return;
    }

    if (!formData.initialBalance) {
      setError('Vui lòng nhập số dư ban đầu');
      return;
    }

    const balance = Number(formData.initialBalance.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(balance) || balance < 0) {
      setError('Số dư phải là số không âm');
      return;
    }

    try {
      await createWallet({
        name: formData.name.trim(),
        balance: Number(formData.initialBalance),
        currency: 'VND',
      });

      if (typeof onRefreshWallets === 'function') {
        await onRefreshWallets();
      }

      setFormData({ name: '', initialBalance: '' });
      setError('');
      setShowForm(false);
    } catch (apiError) {
      console.error('Failed to create wallet:', apiError);
      alert('Không thể tạo ví. Vui lòng thử lại.');
    }
  };

  const handleDeleteWallet = async (walletId) => {
    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xoá ví này không?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteWallet(walletId);
      if (typeof onRefreshWallets === 'function') {
        await onRefreshWallets();
      }
    } catch (apiError) {
      console.error('Failed to delete wallet:', apiError);
      alert('Không thể xoá ví. Vui lòng thử lại.');
    }
  };

  const handleEditWallet = async (wallet) => {
    const newName = window.prompt('Nhập tên ví mới', wallet.name || '');

    if (!newName || !newName.trim()) {
      return;
    }

    try {
      await updateWallet(wallet.id, {
        name: newName.trim(),
        currency: 'VND',
      });

      if (typeof onRefreshWallets === 'function') {
        await onRefreshWallets();
      }
    } catch (apiError) {
      console.error('Failed to update wallet:', apiError);
      alert('Không thể cập nhật ví. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', initialBalance: '' });
    setError('');
    setShowForm(false);
  };

  const transferTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions.filter(isTransferTransaction) : []),
    [transactions]
  );

  return (
    <div className="w-full overflow-hidden space-y-4 pt-6 px-4 sm:px-6">
      <div className="flex flex-row items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
            Quản lý
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">Ví của tôi</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors shrink-0"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Thêm ví</span>
        </button>
      </div>

      {showForm && (
        <div className="w-full max-w-full rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo ví mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Tên ví
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví tiền mặt, Thẻ VCB..."
                className="w-full max-w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Số dư ban đầu
              <input
                type="number"
                name="initialBalance"
                value={formData.initialBalance}
                onChange={handleInputChange}
                placeholder="Ví dụ: 1000000"
                min="0"
                step="1000"
                className="w-full max-w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </label>

            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm sm:text-base font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2 text-sm sm:text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
              >
                Tạo ví
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="w-full overflow-hidden">
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex flex-row items-center justify-between w-full max-w-full rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow gap-3"
              >
                {/* Left: Icon, Name, and Balance */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center h-12 w-12 shrink-0 rounded-full bg-indigo-50">
                    <Wallet size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{wallet.name}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatVND(wallet.balance)}
                    </p>
                  </div>
                </div>

                {/* Right: Action Buttons (Icon-only) */}
                <div className="flex flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditWallet(wallet)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Sửa ví"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Xoá ví"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12">
            <div className="text-center px-4">
              <Wallet size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Chưa có ví nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Nhấn "Thêm ví" để tạo ví mới
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden px-4 sm:px-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Lịch sử chuyển tiền</p>
          <h3 className="text-xl font-semibold text-gray-900">LỊCH SỬ CHUYỂN TIỀN</h3>
        </div>

        <div className="mt-4">
          {transferTransactions.length > 0 ? (
            <div className="space-y-3">
              {transferTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm mb-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <ArrowLeftRight size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {getTransferRouteLabel(transaction)}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {formatTransferDateTime(transaction) || 'Không có thời gian'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatVND(transaction.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-10">
              <p className="text-sm text-gray-500 text-center">Chưa có giao dịch chuyển tiền nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletManager;
