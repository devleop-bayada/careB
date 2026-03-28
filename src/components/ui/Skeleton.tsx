import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circle' | 'card' | 'list';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  lines?: number;
}

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );
}

export default function Skeleton({ variant = 'text', className, lines = 3 }: SkeletonProps) {
  if (variant === 'circle') {
    return <SkeletonBase className={cn('rounded-full w-12 h-12', className)} />;
  }

  if (variant === 'card') {
    return (
      <div className={cn('bg-white rounded-2xl border border-gray-100 p-4 space-y-3', className)}>
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-14 h-14 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
            <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBase className="h-4 w-2/3" />
              <SkeletonBase className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // text variant
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}
