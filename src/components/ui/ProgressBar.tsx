'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ProgressBar({
  value,
  color,
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-100 rounded-full overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-200',
            color || 'bg-primary-500',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="block text-xs text-gray-500 mt-1 text-right">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
