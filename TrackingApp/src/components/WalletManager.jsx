import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';

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

const WalletManager = ({ wallets = [], onAddWallet }) => {
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

  const handleSubmit = (event) => {
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

    if (typeof onAddWallet === 'function') {
      onAddWallet({
        name: formData.name.trim(),
        initialBalance: balance,
      });
    }

    setFormData({ name: '', initialBalance: '' });
    setShowForm(false);
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
