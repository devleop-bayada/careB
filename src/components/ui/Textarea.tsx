'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, maxLength, currentLength, id, ...props }, ref) => {
    const textareaId = id || label;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          className={cn(
            'w-full bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 text-base px-4 py-3 transition-colors duration-150 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200',
            className,
          )}
          {...props}
        />
        <div className="flex justify-between items-center mt-1.5">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <span />
          )}
          {maxLength !== undefined && (
            <span className="text-xs text-gray-400 ml-auto">
              {currentLength ?? 0}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
