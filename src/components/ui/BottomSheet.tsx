'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  className?: string;
}

const heightStyles = {
  auto: 'max-h-[85vh]',
  half: 'h-[50vh]',
  full: 'h-[95vh]',
};

export default function BottomSheet({ isOpen, onClose, title, children, height = 'auto', className }: BottomSheetProps) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-[600px] bg-white rounded-t-3xl shadow-2xl flex flex-col',
          heightStyles[height],
          'animate-in slide-in-from-bottom duration-300',
          className,
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="px-5 py-4 max-h-[75vh] overflow-y-auto pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
