'use client';

import { cn } from '@/lib/utils';
import Radio from './Radio';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export default function RadioGroup({ value, onChange, options, direction = 'vertical', className }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4',
        className,
      )}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-start gap-2.5">
          <Radio
            checked={value === option.value}
            onChange={onChange}
            value={option.value}
            label={option.label}
          />
          {option.description && (
            <p className="text-xs text-gray-400 mt-0.5 ml-7">{option.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
