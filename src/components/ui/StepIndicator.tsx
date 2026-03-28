'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export default function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200',
                  isCompleted && 'bg-primary-500 text-white',
                  isCurrent && 'bg-primary-500 text-white ring-4 ring-primary-100',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 whitespace-nowrap',
                  isCurrent ? 'text-primary-600 font-medium' : 'text-gray-400',
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-1.25rem] transition-all duration-200',
                  isCompleted ? 'bg-primary-500' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
