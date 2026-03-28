'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 14, md: 18, lg: 24 };

export default function Rating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  className,
}: RatingProps) {
  const px = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value >= i + 0.5;

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              'relative focus:outline-none',
              interactive && 'hover:scale-110 transition-transform cursor-pointer',
              !interactive && 'cursor-default',
            )}
            style={{ width: px, height: px }}
          >
            {/* Background star (empty) */}
            <Star
              size={px}
              className="text-gray-200 absolute inset-0"
              fill="currentColor"
              strokeWidth={0}
            />
            {/* Filled or half-filled overlay */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: half ? '50%' : filled ? '100%' : '0%' }}
            >
              <Star
                size={px}
                className="text-yellow-400"
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
