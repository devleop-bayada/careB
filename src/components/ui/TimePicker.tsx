'use client';

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface TimePickerProps {
  value: string; // "09:00" 형식 (24시간)
  onChange: (time: string) => void;
  placeholder?: string;
  label?: string;
}

const MINUTE_OPTIONS = ['00', '10', '20', '30', '40', '50'];
const HOURS_AM = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HOURS_PM = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function parseTo12h(value: string): { ampm: 'AM' | 'PM'; hour: number; minute: string } {
  if (!value) return { ampm: 'AM', hour: 9, minute: '00' };
  const [hStr, mStr] = value.split(':');
  const h24 = parseInt(hStr);
  const minute = mStr ? mStr.padStart(2, '0') : '00';
  if (h24 === 0) return { ampm: 'AM', hour: 12, minute };
  if (h24 < 12) return { ampm: 'AM', hour: h24, minute };
  if (h24 === 12) return { ampm: 'PM', hour: 12, minute };
  return { ampm: 'PM', hour: h24 - 12, minute };
}

function to24h(ampm: 'AM' | 'PM', hour: number, minute: string): string {
  let h24: number;
  if (ampm === 'AM') {
    h24 = hour === 12 ? 0 : hour;
  } else {
    h24 = hour === 12 ? 12 : hour + 12;
  }
  return `${String(h24).padStart(2, '0')}:${minute}`;
}

function formatDisplay(value: string): string | null {
  if (!value) return null;
  const { ampm, hour, minute } = parseTo12h(value);
  return `${ampm === 'AM' ? '오전' : '오후'} ${hour}:${minute}`;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = '시간 선택',
  label,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initial = useMemo(() => parseTo12h(value), [value]);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.ampm);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  // value가 외부에서 바뀌면 내부 상태 동기화
  useEffect(() => {
    const p = parseTo12h(value);
    setAmpm(p.ampm);
    setHour(p.hour);
    setMinute(p.minute);
  }, [value]);

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

  function handleConfirm() {
    onChange(to24h(ampm, hour, minute));
    setIsOpen(false);
  }

  const displayText = formatDisplay(value);
  const hours = ampm === 'AM' ? HOURS_AM : HOURS_PM;

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
        <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
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

              {/* 헤더 */}
              <div className="px-5 pb-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">시간 선택</h3>
              </div>

              <div className="px-5 py-4 space-y-5">
                {/* 오전/오후 토글 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAmpm('AM')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors',
                      ampm === 'AM'
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
                    )}
                  >
                    오전
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmpm('PM')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors',
                      ampm === 'PM'
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
                    )}
                  >
                    오후
                  </button>
                </div>

                {/* 시 선택 (4×3 그리드) */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">시</p>
                  <div className="grid grid-cols-4 gap-2">
                    {hours.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHour(h)}
                        className={cn(
                          'h-11 rounded-xl text-sm font-semibold border-2 transition-colors',
                          h === hour
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-300',
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 분 선택 (6개 버튼) */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">분</p>
                  <div className="grid grid-cols-6 gap-2">
                    {MINUTE_OPTIONS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinute(m)}
                        className={cn(
                          'h-11 rounded-xl text-sm font-semibold border-2 transition-colors',
                          m === minute
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-300',
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              <div className="px-5 pb-6 pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl text-sm hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                  {ampm === 'AM' ? '오전' : '오후'} {hour}:{minute} 선택
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
