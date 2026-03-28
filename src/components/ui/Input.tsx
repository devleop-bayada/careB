'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, iconLeft, id, ...props }, ref) => {
    const inputId = id || label;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 text-base transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              iconLeft ? 'pl-10 pr-4' : 'px-4',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-200',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
