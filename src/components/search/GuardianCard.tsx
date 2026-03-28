'use client';

import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface GuardianCardProps {
  id: string;
  elderAge: string;
  careLevel?: string;
  mobilityLevel?: string;
  careType: string;
  days: string[];
  timeRange: string;
  region: string;
  hourlyRate: number;
  postedAt: Date | string;
  className?: string;
}

export default function GuardianCard({
  id,
  elderAge,
  careLevel,
  mobilityLevel,
  careType,
  days,
  timeRange,
  region,
  hourlyRate,
  postedAt,
  className,
}: GuardianCardProps) {
  return (
    <Link href={`/guardian/${id}`} className={cn('block', className)}>
      <div className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-base">
              어르신 {elderAge}
              {careLevel && <span className="text-gray-500 text-sm ml-1">({careLevel})</span>}
            </span>
            <Badge variant="blue" size="sm">{careType}</Badge>
            {mobilityLevel && <Badge variant="gray" size="sm">{mobilityLevel}</Badge>}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2 mt-0.5">
            {formatRelativeDate(postedAt)}
          </span>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1.5">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{days.join(', ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1.5">
          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{timeRange}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{region}</span>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-end">
          <span className="text-base font-bold text-primary-500">
            {hourlyRate.toLocaleString('ko-KR')}원/시
          </span>
        </div>
      </div>
    </Link>
  );
}
