'use client';

import { cn } from '@/lib/utils';

interface RadioProps {
  checked?: boolean;
  onChange?: (value: string) => void;
  label?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export default function Radio({ checked = false, onChange, label, value = '', disabled = false, className }: RadioProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2.5 select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(value)}
        className={cn(
          'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0',
          checked
            ? 'border-primary-500'
            : 'border-gray-300 hover:border-primary-400',
          disabled && 'pointer-events-none',
        )}
      >
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
      </button>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
