'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || '선택';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (size === 'sm') {
    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            value
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
          )}
        >
          <span>{displayText}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform',
              isOpen && 'rotate-180',
              value ? 'text-white' : 'text-gray-400',
            )}
          />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] bg-white rounded-xl border border-gray-200 shadow-lg py-1 max-h-[240px] overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors',
                    opt.value === value
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <Check className="h-3.5 w-3.5 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // size === 'md' - form field style with bottom sheet dropdown
  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-12 bg-gray-50 border rounded-xl text-base px-4 pr-10 text-left transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white',
          'border-gray-200',
          !selectedOption && 'text-gray-400',
          selectedOption && 'text-gray-900',
        )}
      >
        {displayText}
      </button>
      <ChevronDown
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform',
          isOpen && 'rotate-180',
        )}
      />

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          {/* Bottom sheet dropdown */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-[600px] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              {placeholder && (
                <div className="px-5 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">{placeholder}</h3>
                </div>
              )}
              <div className="max-h-[60vh] overflow-y-auto pb-safe">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors',
                      opt.value === value
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {opt.value === value && (
                      <Check className="h-4 w-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
