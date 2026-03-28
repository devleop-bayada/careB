'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';

interface CareSession {
  id: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

interface CareCalendarProps {
  markedDates?: string[]; // ISO date strings e.g. '2024-03-15'
  sessions?: Record<string, CareSession[]>; // date -> sessions
  onDayClick?: (date: string) => void;
  className?: string;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-400',
  IN_PROGRESS: 'bg-green-400',
  COMPLETED: 'bg-gray-400',
  CANCELLED: 'bg-red-400',
};

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CareCalendar({ markedDates = [], sessions = {}, onDayClick, className }: CareCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const markedSet = new Set(markedDates);

  // Count marked dates in current month for summary
  const monthMarkedCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter((day) => markedSet.has(toDateString(year, month, day))).length;

  function prevMonth() {
    setSelectedDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    setSelectedDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
    onDayClick?.(dateStr);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedSessions = selectedDate ? (sessions[selectedDate] || []) : [];

  return (
    <div className={cn('px-4 py-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="text-center">
          <span className="text-base font-semibold text-gray-900">
            {year}년 {month + 1}월
          </span>
          {monthMarkedCount > 0 && (
            <p className="text-[10px] text-primary-500 font-medium mt-0.5">
              이번 달 {monthMarkedCount}건의 돌봄
            </p>
          )}
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={cn(
            'text-center text-xs font-medium py-1',
            i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500',
          )}>
            {d}
          </span>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = toDateString(year, month, day);
          const isToday = dateStr === todayStr;
          const isMarked = markedSet.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const col = idx % 7;
          const daySessions = sessions[dateStr] || [];
          const dotCount = Math.min(daySessions.length || (isMarked ? 1 : 0), 3);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                'relative flex flex-col items-center justify-center h-11 rounded-xl text-sm font-medium transition-colors',
                isSelected && !isToday ? 'bg-primary-100 ring-2 ring-primary-400' : '',
                isToday ? 'bg-primary-500 text-white' : 'hover:bg-gray-100',
                !isToday && !isSelected && col === 0 && 'text-red-400',
                !isToday && !isSelected && col === 6 && 'text-blue-400',
                !isToday && !isSelected && col !== 0 && col !== 6 && 'text-gray-800',
              )}
            >
              {day}
              {/* Dots for sessions */}
              {dotCount > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: dotCount }).map((_, di) => {
                    const sessionStatus = daySessions[di]?.status || '';
                    const dotColor = STATUS_COLORS[sessionStatus] || (isToday ? 'bg-white' : 'bg-primary-500');
                    return (
                      <span key={di} className={cn('w-1 h-1 rounded-full', dotColor)} />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary-500" />
            {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </h3>
          {selectedSessions.length === 0 && !markedSet.has(selectedDate) ? (
            <p className="text-xs text-gray-400 text-center py-4">이 날짜에 돌봄 일정이 없어요</p>
          ) : selectedSessions.length === 0 ? (
            <div className="bg-primary-50 rounded-xl px-3 py-2.5">
              <p className="text-xs text-primary-600 font-medium">돌봄 일정이 있는 날이에요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{session.title || '돌봄'}</p>
                    {session.startTime && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {session.startTime}{session.endTime ? ` ~ ${session.endTime}` : ''}
                      </p>
                    )}
                  </div>
                  {session.status && (
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      session.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                      session.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                      'bg-gray-100 text-gray-500',
                    )}>
                      {session.status === 'SCHEDULED' ? '예정' :
                       session.status === 'IN_PROGRESS' ? '진행 중' :
                       session.status === 'COMPLETED' ? '완료' : session.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
