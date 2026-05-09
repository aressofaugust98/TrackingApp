import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceChatModal from './VoiceChatModal';

const VoiceChatLauncher = ({ onRefreshTransactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <VoiceChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onShowToast={showToast}
        onRefreshTransactions={onRefreshTransactions}
      />

      {toast ? (
        <div
          className={`fixed z-50 bottom-28 right-4 md:bottom-10 md:right-28 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] ${
            toast.tone === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      {!isOpen ? (
        <div className="fixed z-40 bottom-24 right-20 md:bottom-10 md:right-28 flex flex-col items-end gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] ring-1 ring-white/30 transition hover:scale-105 hover:shadow-[0_24px_60px_rgba(15,23,42,0.45)]"
            aria-label="Mở ghi âm giao dịch"
          >
            <Mic size={24} />
          </button>
        </div>
      ) : null}
    </>
  );
};

export default VoiceChatLauncher;
