import React, { useState } from 'react';
import { createWallet } from '../services/walletService';

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0);
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = () => setStep(1);

  const handleNext = () => {
    if (walletName.trim() !== '' && initialBalance !== '') {
      setStep(2);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createWallet({
        name: walletName.trim(),
        balance: Number(initialBalance),
        currency: 'VND',
      });
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo ví.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {step === 0 && (
          <div className="p-10 text-center flex flex-col items-center space-y-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">👋</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-extrabold text-gray-900">Chào mừng bạn đến với FinTrack! 🎉</h1>
              <p className="text-gray-500 text-base leading-relaxed">Hãy dành 1 phút để thiết lập nền móng cho kế hoạch tài chính của bạn.</p>
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]">
              Bắt đầu ngay
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="p-10 flex flex-col space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Ví đầu tiên của bạn</h2>
              <p className="text-gray-500 text-sm">Bạn đang để tiền ở đâu? (Ví dụ: Tiền mặt, Thẻ ATM...)</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên ví</label>
                <input 
                  type="text" 
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="VD: Tiền mặt" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số dư ban đầu</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0" 
                    className="w-full border border-gray-300 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(0)}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all">
                Trở lại
              </button>
              <button
                onClick={handleNext}
                disabled={!walletName.trim() || initialBalance === ''}
                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-md active:scale-[0.98]">
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 text-center flex flex-col items-center space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🚀</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-gray-900">Tuyệt vời, bạn đã sẵn sàng!</h2>
              <p className="text-gray-500 text-base leading-relaxed">Chúng tôi đã tạo ví cho bạn.</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="w-full flex space-x-3">
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all disabled:opacity-50">
                Sửa
              </button>
              <button
                onClick={handleFinalize}
                disabled={isSubmitting}
                className="w-2/3 flex-1 flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]">
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Khám phá Dashboard'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
