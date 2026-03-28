import React, { useEffect, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';

const InAppScanner = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Unable to access camera:', error);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      const stream = streamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (typeof onCapture === 'function') {
          onCapture(blob);
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      },
      'image/jpeg',
      0.92,
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (typeof onCapture === 'function') {
        onCapture(file);
      }
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video ref={videoRef} autoPlay playsInline className="object-cover w-full h-full" />

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div className="h-[62vh] w-full max-w-sm rounded-3xl border-2 border-white/65 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-8 pt-20">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-black/45"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCapture}
          className="group relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Capture"
        >
          <span className="absolute inset-1 rounded-full border-4 border-black/15" />
          <Camera size={26} className="relative" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-black/45"
        >
          <Image size={16} />
          Gallery
        </button>
      </div>
    </div>
  );
};

export default InAppScanner;
