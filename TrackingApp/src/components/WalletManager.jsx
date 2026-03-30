import React, { useState } from 'react';
import { Edit2, Plus, Trash2, Wallet } from 'lucide-react';
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

const WalletManager = ({ wallets = [], onRefreshWallets }) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
            Quản lý
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">Ví của tôi</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus size={20} />
          <span>Thêm ví</span>
        </button>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
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
                className="rounded-2xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
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
                className="rounded-2xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </label>

            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
              >
                Tạo ví
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50">
                <Wallet size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{wallet.name}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatVND(wallet.balance)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditWallet(wallet)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  title="Sửa ví"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWallet(wallet.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Xoá ví"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12">
            <div className="text-center">
              <Wallet size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Chưa có ví nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Nhấn "Thêm ví" để tạo ví mới
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletManager;
