'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({ onSearch, debounceMs = 300, className, placeholder = '검색어를 입력하세요', ...props }: SearchBarProps) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, debounceMs, onSearch]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 bg-gray-100 rounded-2xl pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors duration-150',
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); onSearch?.(''); }}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
