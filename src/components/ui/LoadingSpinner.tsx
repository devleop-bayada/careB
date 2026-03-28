import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 32, className, fullPage = false }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
        <Loader2 size={size} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center py-10', className)}>
      <Loader2 size={size} className="animate-spin text-primary-500" />
    </div>
  );
}
