'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({ checked = false, onChange, label, disabled = false, className }: CheckboxProps) {
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
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200 flex-shrink-0',
          checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white border-gray-300 hover:border-primary-400',
          disabled && 'pointer-events-none',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </button>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
