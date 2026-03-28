import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  className?: string;
}

export default function SectionHeader({ title, moreHref, moreLabel = '더보기', className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-2', className)}>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex items-center gap-0.5 text-sm text-gray-400 hover:text-primary-500 transition-colors"
        >
          {moreLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
