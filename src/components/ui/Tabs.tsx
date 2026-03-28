'use client';

import { cn } from '@/lib/utils';

export interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export default function Tabs({ tabs, activeKey, onChange, variant = 'underline', className }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap',
              activeKey === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('border-b border-gray-100', className)}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-shrink-0 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2 -mb-px',
              activeKey === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
