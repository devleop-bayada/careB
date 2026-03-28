'use client';

import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  className,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial value or use today
  const parsed = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2]),
      };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }, [value]);

  const [selectedYear, setSelectedYear] = useState(parsed.year);
  const [selectedMonth, setSelectedMonth] = useState(parsed.month);
  const [selectedDay, setSelectedDay] = useState(parsed.day);

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= 1920; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  );

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  // Scroll to selected items when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        scrollToSelected(yearRef, years.indexOf(selectedYear));
        scrollToSelected(monthRef, months.indexOf(selectedMonth));
        scrollToSelected(dayRef, days.indexOf(selectedDay));
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function scrollToSelected(ref: React.RefObject<HTMLDivElement | null>, index: number) {
    if (ref.current && index >= 0) {
      const itemHeight = 44;
      ref.current.scrollTop = index * itemHeight - ref.current.clientHeight / 2 + itemHeight / 2;
    }
  }

  function handleConfirm() {
    const m = String(selectedMonth).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    onChange(`${selectedYear}-${m}-${d}`);
    setIsOpen(false);
  }

  const displayText = value
    ? `${value.split('-')[0]}년 ${parseInt(value.split('-')[1])}월 ${parseInt(value.split('-')[2])}일`
    : placeholder;

  return (
    <div className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-left transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
          'flex items-center justify-between',
          !value && 'text-gray-400',
          value && 'text-gray-900',
        )}
      >
        <span>{displayText}</span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-[600px] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="px-5 pb-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">날짜 선택</h3>
              </div>

              {/* Scroll columns */}
              <div className="flex h-[240px] px-4 py-2">
                {/* Year */}
                <div ref={yearRef} className="flex-1 overflow-y-auto scrollbar-hide">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      className={cn(
                        'w-full h-[44px] flex items-center justify-center text-sm transition-colors',
                        y === selectedYear
                          ? 'text-primary-600 font-bold bg-primary-50 rounded-lg'
                          : 'text-gray-600 hover:bg-gray-50 rounded-lg',
                      )}
                    >
                      {y}년
                    </button>
                  ))}
                </div>
                {/* Month */}
                <div ref={monthRef} className="flex-1 overflow-y-auto scrollbar-hide">
                  {months.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMonth(m)}
                      className={cn(
                        'w-full h-[44px] flex items-center justify-center text-sm transition-colors',
                        m === selectedMonth
                          ? 'text-primary-600 font-bold bg-primary-50 rounded-lg'
                          : 'text-gray-600 hover:bg-gray-50 rounded-lg',
                      )}
                    >
                      {m}월
                    </button>
                  ))}
                </div>
                {/* Day */}
                <div ref={dayRef} className="flex-1 overflow-y-auto scrollbar-hide">
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={cn(
                        'w-full h-[44px] flex items-center justify-center text-sm transition-colors',
                        d === selectedDay
                          ? 'text-primary-600 font-bold bg-primary-50 rounded-lg'
                          : 'text-gray-600 hover:bg-gray-50 rounded-lg',
                      )}
                    >
                      {d}일
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm */}
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl text-sm hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                  {selectedYear}년 {selectedMonth}월 {selectedDay}일 선택
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
