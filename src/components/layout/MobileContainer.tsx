import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn('max-w-[600px] mx-auto w-full min-h-screen bg-white relative', className)}>
      {children}
    </div>
  );
}
