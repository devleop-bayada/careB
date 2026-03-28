import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface CaregiverPreview {
  id: string;
  name: string;
  profileImage?: string | null;
  caregiverType: string;
  rating?: number;
  region: string;
}

interface RecentCaregiversProps {
  caregivers?: CaregiverPreview[];
  className?: string;
}

const PLACEHOLDER_CAREGIVERS: CaregiverPreview[] = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  name: '요양보호사',
  caregiverType: '방문요양',
  rating: 4.8,
  region: '서울',
}));

export default function RecentCaregivers({ caregivers, className }: RecentCaregiversProps) {
  const displayCaregivers = caregivers ?? PLACEHOLDER_CAREGIVERS;

  return (
    <div className={cn('', className)}>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-2">
        {displayCaregivers.map((caregiver) => (
          <Link
            key={caregiver.id}
            href={`/caregiver/${caregiver.id}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 w-20 group"
          >
            <div className="relative">
              <Avatar
                src={caregiver.profileImage}
                name={caregiver.name}
                size="lg"
                className="group-active:opacity-80 transition-opacity"
              />
              {caregiver.rating !== undefined && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">
                  <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-gray-700">{caregiver.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-800 truncate w-full">{caregiver.name}</p>
              <p className="text-[10px] text-gray-400 truncate w-full">{caregiver.region}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
