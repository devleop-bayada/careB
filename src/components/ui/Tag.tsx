'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  color?: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function Tag({ children, color, removable = false, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200',
        color || 'bg-primary-50 text-primary-600',
        className,
      )}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity duration-200"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
