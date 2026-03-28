'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  active?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Chip({ label, active = false, onToggle, onRemove, disabled = false, className }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 select-none',
        active
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {label}
      {onRemove && active && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
