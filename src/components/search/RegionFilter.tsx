'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import { REGIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RegionFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (region: { city: string; district?: string }) => void;
  selected?: { city: string; district?: string };
}

export default function RegionFilter({ isOpen, onClose, onSelect, selected }: RegionFilterProps) {
  const [selectedCity, setSelectedCity] = useState<string>(selected?.city ?? '');

  const cityData = REGIONS.find((r) => r.label === selectedCity);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="지역 선택">
      <div className="flex gap-3 h-64">
        {/* Level 1: 시/도 */}
        <div className="w-1/3 overflow-y-auto border-r border-gray-100">
          {REGIONS.map((region) => (
            <button
              key={region.label}
              type="button"
              onClick={() => setSelectedCity(region.label)}
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm font-medium transition-colors',
                selectedCity === region.label
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {region.label}
            </button>
          ))}
        </div>

        {/* Level 2: 시/군/구 */}
        <div className="flex-1 overflow-y-auto">
          {selectedCity && (
            <>
              <button
                type="button"
                onClick={() => { onSelect({ city: selectedCity }); onClose(); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-sm font-medium transition-colors',
                  !selected?.district && selected?.city === selectedCity
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                전체
              </button>
              {cityData?.districts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => { onSelect({ city: selectedCity, district }); onClose(); }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm transition-colors',
                    selected?.city === selectedCity && selected?.district === district
                      ? 'text-primary-600 bg-primary-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {district}
                </button>
              ))}
            </>
          )}
          {!selectedCity && (
            <p className="text-sm text-gray-400 px-3 py-4">시/도를 먼저 선택해 주세요.</p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
