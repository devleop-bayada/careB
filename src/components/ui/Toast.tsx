'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
}

const typeStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-gray-800/90 border-transparent text-white',
    icon: <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-gray-800/90 border-transparent text-white',
    icon: <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-gray-800/90 border-transparent text-white',
    icon: <Info className="h-5 w-5 text-white/70 flex-shrink-0" />,
  },
};

export default function Toast({ id, type = 'info', message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const { bg, icon } = typeStyles[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-medium max-w-[340px] w-full',
        'animate-in slide-in-from-top duration-300',
        bg,
      )}
    >
      {icon}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
