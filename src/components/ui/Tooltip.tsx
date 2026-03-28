'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export default function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(true)}
      onTouchEnd={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg transition-all duration-200',
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
          <span
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45',
              position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1',
            )}
          />
        </div>
      )}
    </div>
  );
}
