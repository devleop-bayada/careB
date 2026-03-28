'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ListItemProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function ListItem({ icon: Icon, title, subtitle, right, onClick, href, className }: ListItemProps) {
  const Comp = href ? 'a' : 'div';
  const interactive = !!(onClick || href);

  return (
    <Comp
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5',
        interactive && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200',
        className,
      )}
    >
      {Icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right ? (
        <div className="flex-shrink-0">{right}</div>
      ) : interactive ? (
        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
      ) : null}
    </Comp>
  );
}
