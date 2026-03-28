'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={cn('flex items-center justify-center gap-4 py-4', className)}>
      <button
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full transition-colors',
          canPrev
            ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            : 'text-gray-300 cursor-not-allowed',
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="text-sm text-gray-700 font-medium">
        <span className="text-primary-500">{currentPage}</span>
        <span className="text-gray-400 mx-1">/</span>
        {totalPages}
      </span>

      <button
        onClick={() => canNext && onPageChange(currentPage + 1)}
        disabled={!canNext}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full transition-colors',
          canNext
            ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            : 'text-gray-300 cursor-not-allowed',
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
