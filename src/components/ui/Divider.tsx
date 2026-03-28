import { cn } from '@/lib/utils';

interface DividerProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  return <div className={cn('h-px bg-gray-200', className)} />;
}
