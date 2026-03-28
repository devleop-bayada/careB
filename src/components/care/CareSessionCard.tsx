import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { CARE_STATUS_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface CareSessionCardProps {
  id: string;
  date: string;
  timeRange: string;
  otherPartyName: string;
  otherPartyImage?: string | null;
  status: keyof typeof CARE_STATUS_MAP;
  careRecipientNames?: string[];
  className?: string;
}

export default function CareSessionCard({
  date,
  timeRange,
  otherPartyName,
  otherPartyImage,
  status,
  careRecipientNames = [],
  className,
}: CareSessionCardProps) {
  const statusInfo = CARE_STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{timeRange}</span>
          </div>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Avatar src={otherPartyImage} name={otherPartyName} size="sm" />
        <div>
          <span className="text-sm font-semibold text-gray-800">{otherPartyName}</span>
          {careRecipientNames.length > 0 && (
            <p className="text-xs text-gray-500">어르신: {careRecipientNames.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
