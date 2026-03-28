'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export default function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인',
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-w-[320px] bg-white rounded-2xl shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200',
          'p-6 text-center',
        )}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl text-sm hover:bg-primary-600 active:bg-primary-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
