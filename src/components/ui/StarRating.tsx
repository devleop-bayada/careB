'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMap = { sm: 16, md: 20 };

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const px = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = value >= i + 1;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(i + 1)}
            className={cn(
              'relative focus:outline-none transition-transform duration-200',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default',
            )}
            style={{ width: px, height: px }}
          >
            <Star
              size={px}
              className={filled ? 'text-yellow-400' : 'text-gray-200'}
              fill="currentColor"
              strokeWidth={0}
            />
          </button>
        );
      })}
    </div>
  );
}
