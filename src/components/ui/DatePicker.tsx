'use client';

import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface DatePickerProps {
  value: string; // "2026-03-30" 형식
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  label?: string;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function parseDate(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  minDate,
  maxDate,
  label,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);

  const initial = useMemo(() => {
    return parseDate(value) ?? today;
  }, [value, today]);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // value가 바뀌면 뷰도 동기화
  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // 달력이 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(year: number, month: number, day: number) {
    const str = toDateStr(year, month, day);
    if (minDate && str < minDate) return;
    if (maxDate && str > maxDate) return;
    onChange(str);
    setIsOpen(false);
  }

  // 달력 날짜 그리드 계산
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=일
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: { year: number; month: number; day: number; current: boolean }[] = [];

    // 이전 달 날짜 채우기
    for (let i = firstDay - 1; i >= 0; i--) {
      const pm = viewMonth === 1 ? 12 : viewMonth - 1;
      const py = viewMonth === 1 ? viewYear - 1 : viewYear;
      cells.push({ year: py, month: pm, day: daysInPrevMonth - i, current: false });
    }

    // 현재 달 날짜
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ year: viewYear, month: viewMonth, day: d, current: true });
    }

    // 다음 달 날짜로 채우기 (6줄 완성)
    const nm = viewMonth === 12 ? 1 : viewMonth + 1;
    const ny = viewMonth === 12 ? viewYear + 1 : viewYear;
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ year: ny, month: nm, day: nextDay++, current: false });
    }
    // 최소 5줄 보장
    while (cells.length < 35) {
      cells.push({ year: ny, month: nm, day: nextDay++, current: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const displayText = useMemo(() => {
    const p = parseDate(value);
    if (!p) return null;
    return `${p.year}년 ${p.month}월 ${p.day}일`;
  }, [value]);

  const todayStr = toDateStr(today.year, today.month, today.day);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-left',
          'flex items-center justify-between transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white',
          displayText ? 'text-gray-900' : 'text-gray-400',
        )}
      >
        <span>{displayText ?? placeholder}</span>
        <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          {/* 바텀시트 */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-[600px] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* 드래그 핸들 */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* 헤더: 월 이동 */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600 text-lg font-bold"
                >
                  ‹
                </button>
                <span className="text-base font-semibold text-gray-900">
                  {viewYear}년 {viewMonth}월
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600 text-lg font-bold"
                >
                  ›
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 px-4 pt-3">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div
                    key={d}
                    className={cn(
                      'h-8 flex items-center justify-center text-xs font-semibold',
                      i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500',
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 px-4 pb-3">
                {calendarDays.map((cell, idx) => {
                  const cellStr = toDateStr(cell.year, cell.month, cell.day);
                  const isSelected = cellStr === value;
                  const isToday = cellStr === todayStr;
                  const isDisabled =
                    !cell.current ||
                    (!!minDate && cellStr < minDate) ||
                    (!!maxDate && cellStr > maxDate);
                  const col = idx % 7; // 0=일, 6=토

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !isDisabled && handleDayClick(cell.year, cell.month, cell.day)}
                      disabled={isDisabled}
                      className={cn(
                        'h-11 flex items-center justify-center text-sm rounded-full transition-colors',
                        isSelected && 'bg-primary-500 text-white font-bold',
                        !isSelected && isToday && 'ring-2 ring-primary-400 ring-inset font-semibold',
                        !isSelected && !isDisabled && col === 0 && 'text-red-400 hover:bg-red-50',
                        !isSelected && !isDisabled && col === 6 && 'text-blue-400 hover:bg-blue-50',
                        !isSelected && !isDisabled && col > 0 && col < 6 && 'text-gray-800 hover:bg-gray-100',
                        isDisabled && 'text-gray-300 cursor-not-allowed',
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* 하단 여백 (safe area) */}
              <div className="h-4" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
