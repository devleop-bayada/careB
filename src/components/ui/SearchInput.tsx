'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = '검색어를 입력하세요',
  className,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 bg-gray-100 rounded-2xl pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all duration-200',
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
