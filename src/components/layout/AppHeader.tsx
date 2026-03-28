'use client';

import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
  unreadCount?: number;
  className?: string;
}

export default function AppHeader({ unreadCount = 0, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white border-b border-gray-100',
        className,
      )}
      style={{ height: 56 }}
    >
      <div className="max-w-[600px] mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center select-none">
          <span className="text-xl font-bold">
            <span className="text-primary-500">바야</span>
            <span className="text-gray-900">다</span>
          </span>
        </Link>

        {/* Notification bell */}
        <Link href="/notifications" className="relative p-2 -mr-2">
          <Bell className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
