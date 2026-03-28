'use client';

import { cn } from '@/lib/utils';

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn('inline-flex bg-gray-100 rounded-xl p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
