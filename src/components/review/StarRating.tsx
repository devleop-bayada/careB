'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

export default function StarRating({ value, onChange, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-24 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="focus:outline-none"
          >
            <Star
              size={28}
              className={value >= i + 1 ? 'text-yellow-400' : 'text-gray-300'}
              fill="currentColor"
              strokeWidth={0}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-1">{value > 0 ? `${value}점` : ''}</span>
    </div>
  );
}
