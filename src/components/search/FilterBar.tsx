'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import Chip from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  key: string;
  label: string;
  options?: { value: string; label: string }[];
}

const FILTERS: FilterOption[] = [
  { key: 'region', label: '지역' },
  { key: 'caregiverType', label: '요양보호사유형', options: [
    { value: 'VISITING_CARE', label: '방문요양' },
    { value: 'VISITING_BATH', label: '방문목욕' },
    { value: 'VISITING_NURSING', label: '방문간호' },
    { value: 'DAY_CARE', label: '주야간보호' },
    { value: 'SHORT_TERM', label: '단기보호' },
  ]},
  { key: 'rate', label: '시급', options: [
    { value: 'under10000', label: '1만원 미만' },
    { value: '10000to15000', label: '1~1.5만원' },
    { value: '15000to20000', label: '1.5~2만원' },
    { value: 'over20000', label: '2만원 이상' },
  ]},
  { key: 'schedule', label: '요일/시간' },
  { key: 'certification', label: '인증', options: [
    { value: 'identity', label: '본인인증' },
    { value: 'caregiverLicense', label: '요양보호사 자격증' },
    { value: 'criminalRecord', label: '범죄경력' },
    { value: 'education', label: '교육이수' },
  ]},
  { key: 'sort', label: '정렬', options: [
    { value: 'rating', label: '평점 높은 순' },
    { value: 'review', label: '리뷰 많은 순' },
    { value: 'rate_asc', label: '시급 낮은 순' },
    { value: 'rate_desc', label: '시급 높은 순' },
    { value: 'latest', label: '최신 순' },
  ]},
];

interface FilterBarProps {
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  className?: string;
}

export default function FilterBar({ activeFilters = {}, onFilterChange, className }: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const activeFilter = FILTERS.find((f) => f.key === openFilter);

  return (
    <>
      <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 border-b border-gray-100', className)}>
        {FILTERS.map((filter) => {
          const isActive = !!activeFilters[filter.key];
          const activeOption = filter.options?.find((o) => o.value === activeFilters[filter.key]);
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setOpenFilter(filter.key)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              )}
            >
              {activeOption ? activeOption.label : filter.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      <BottomSheet
        isOpen={!!openFilter}
        onClose={() => setOpenFilter(null)}
        title={activeFilter?.label}
      >
        {activeFilter?.options && (
          <div className="flex flex-wrap gap-2 py-2">
            {activeFilter.options.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={activeFilters[activeFilter.key] === opt.value}
                onToggle={() => {
                  onFilterChange?.(activeFilter.key, opt.value);
                  setOpenFilter(null);
                }}
              />
            ))}
          </div>
        )}
        {!activeFilter?.options && (
          <p className="text-sm text-gray-400 py-4 text-center">필터 옵션을 준비 중입니다.</p>
        )}
      </BottomSheet>
    </>
  );
}
