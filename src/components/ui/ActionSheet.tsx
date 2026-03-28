'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';

interface ActionSheetOption {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'danger';
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
}

export default function ActionSheet({ isOpen, onClose, options, title }: ActionSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[600px] px-4 pb-safe mb-4 space-y-2 animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-2xl overflow-hidden">
          {title && (
            <div className="px-4 py-3 text-center border-b border-gray-100">
              <span className="text-xs text-gray-400">{title}</span>
            </div>
          )}
          {options.map((option, i) => {
            const Icon = option.icon;
            return (
              <button
                key={i}
                onClick={() => { option.onClick(); onClose(); }}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-medium transition-colors duration-200',
                  'hover:bg-gray-50 active:bg-gray-100',
                  i > 0 && 'border-t border-gray-100',
                  option.variant === 'danger' ? 'text-red-500' : 'text-gray-700',
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {option.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          취소
        </button>
      </div>
    </div>
  );
}
