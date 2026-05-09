import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, X } from 'lucide-react';

const FALLBACK_VOICE_CHAT_URL = 'https://scores-avoiding-plan-stating.trycloudflare.com/voice-chat';

const resolveVoiceChatApiUrl = () => {
  const configuredUrl = (import.meta.env.VITE_AI_BASE_URL || '').trim();

  if (!configuredUrl) {
    return import.meta.env.DEV ? '/ai-api/voice-chat' : FALLBACK_VOICE_CHAT_URL;
  }

  if (!import.meta.env.DEV && configuredUrl.startsWith('/')) {
    return FALLBACK_VOICE_CHAT_URL;
  }

  return `${configuredUrl.replace(/\/+$/, '')}/voice-chat`;
};

const VOICE_CHAT_API_URL = resolveVoiceChatApiUrl();

const STATUS = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
};

const VoiceChatModal = ({ isOpen, onClose, onShowToast, onRefreshTransactions }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const shouldProcessRef = useRef(true);

  const notify = (message, tone = 'error') => {
    if (typeof onShowToast === 'function') {
      onShowToast(message, tone);
      return;
    }

    alert(message);
  };

  const stopStreamTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const resetRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopStreamTracks();
    setStatus(STATUS.IDLE);
  };

  const handleRecorderStop = async () => {
    const shouldProcess = shouldProcessRef.current;
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    stopStreamTracks();

    if (!shouldProcess) {
      setStatus(STATUS.IDLE);
      return;
    }

    if (!audioBlob || audioBlob.size === 0) {
      setStatus(STATUS.IDLE);
      notify('Không thể nhận diện giọng nói, vui lòng thử lại.');
      return;
    }

    setStatus(STATUS.PROCESSING);

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('Missing access token');
      }

      const formData = new FormData();
      const voiceFile = new File([audioBlob], 'recording.webm', {
        type: 'audio/webm',
      });

      formData.append('token', token);
      formData.append('audio', voiceFile, voiceFile.name);
      formData.append('file', voiceFile, voiceFile.name);

      const response = await fetch(VOICE_CHAT_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let details = '';

        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            details = errorData?.message || errorData?.error || '';
          } else {
            details = await response.text();
          }
        } catch {
          details = '';
        }

        throw new Error(details || `Voice chat request failed (${response.status})`);
      }

      if (typeof onClose === 'function') {
        onClose();
      }

      notify('Tạo giao dịch thành công!', 'success');

      if (typeof onRefreshTransactions === 'function') {
        onRefreshTransactions();
      }
    } catch (error) {
      notify('Không thể nhận diện giọng nói, vui lòng thử lại.');
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  const startRecording = async () => {
    if (status !== STATUS.IDLE) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      notify('Trình duyệt không hỗ trợ ghi âm. Vui lòng thử lại.');
      return;
    }

    try {
      shouldProcessRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      recorder.addEventListener('stop', handleRecorderStop, { once: true });

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus(STATUS.RECORDING);
    } catch (error) {
      resetRecorder();
      notify('Không thể truy cập micro. Vui lòng kiểm tra quyền.');
    }
  };

  const stopRecording = () => {
    if (status !== STATUS.RECORDING) {
      return;
    }

    shouldProcessRef.current = true;
    setStatus(STATUS.PROCESSING);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setStatus(STATUS.IDLE);
    }
  };

  const handleClose = () => {
    shouldProcessRef.current = false;
    resetRecorder();

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      shouldProcessRef.current = false;
      resetRecorder();
    }
  }, [isOpen]);

  useEffect(() => () => resetRecorder(), []);

  if (!isOpen) {
    return null;
  }

  const statusText =
    status === STATUS.RECORDING
      ? 'Đang ghi âm... Bấm để dừng'
      : status === STATUS.PROCESSING
        ? 'Đang xử lý giọng nói...'
        : 'Bấm để nói';

  const isRecording = status === STATUS.RECORDING;
  const isProcessing = status === STATUS.PROCESSING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-500/80">Voice to Transaction</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Tạo giao dịch bằng giọng nói</h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-5 px-6 py-10 text-center">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`flex h-28 w-28 items-center justify-center rounded-full text-white shadow-[0_18px_50px_rgba(15,23,42,0.25)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
              isRecording
                ? 'bg-rose-600 animate-pulse'
                : isProcessing
                  ? 'bg-slate-400'
                  : 'bg-slate-900 hover:bg-slate-800'
            }`}
            aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
          >
            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
          </button>

          <p className="text-sm font-medium text-slate-700">{statusText}</p>
          <p className="text-xs text-slate-500">Hãy mô tả giao dịch ngắn gọn, ví dụ: "Mua cà phê 40 nghìn".</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatModal;
