'use client';

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Bookmark, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import GradeBadge from '@/components/caregiver/GradeBadge';

interface CaregiverCardProps {
  id: string;
  name: string;
  caregiverType: '방문요양' | '방문목욕' | '방문간호' | '주야간보호' | '단기보호';
  profileImage?: string | null;
  region: string;
  age?: number;
  hourlyRate: number;
  specialties: string[];
  rating?: number;
  reviewCount?: number;
  certifications?: string[];
  gradePoints?: number;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  className?: string;
}

const caregiverTypeBadgeVariant = {
  '방문요양': 'primary',
  '방문목욕': 'blue',
  '방문간호': 'green',
  '주야간보호': 'red',
  '단기보호': 'gray',
} as const;

export default function CaregiverCard({
  id,
  name,
  caregiverType,
  profileImage,
  region,
  age,
  hourlyRate,
  specialties,
  rating,
  reviewCount,
  certifications = [],
  gradePoints,
  isBookmarked = false,
  onBookmark,
  className,
}: CaregiverCardProps) {
  return (
    <Link href={`/caregiver/${id}`} className={cn('block', className)}>
      <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors">
        {/* Avatar */}
        <Avatar src={profileImage} name={name} size="lg" className="flex-shrink-0 mt-0.5" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + type badge + grade */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-base">{name}</span>
            <Badge variant={caregiverTypeBadgeVariant[caregiverType]} size="sm">
              {caregiverType}
            </Badge>
            {gradePoints !== undefined && <GradeBadge points={gradePoints} />}
          </div>

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-sm text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {certifications.slice(0, 3).map((cert) => (
                <span key={cert} className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-md">
                  {cert}
                </span>
              ))}
              {certifications.length > 3 && (
                <span className="text-xs text-gray-400">+{certifications.length - 3}</span>
              )}
            </div>
          )}

          {/* Region + age */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{region}</span>
            {age && <span className="text-gray-300 mx-0.5">·</span>}
            {age && <span>{age}세</span>}
          </div>

          {/* Bottom row: rate + specialties */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 2).map((spec) => (
                <span key={spec} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {spec}
                </span>
              ))}
            </div>
            <span className="text-base font-bold text-primary-500 ml-2 flex-shrink-0">
              {hourlyRate.toLocaleString('ko-KR')}원/시
            </span>
          </div>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onBookmark?.(id); }}
          className="flex-shrink-0 p-1 mt-0.5"
        >
          <Bookmark
            className={cn(
              'h-5 w-5 transition-colors',
              isBookmarked ? 'text-primary-500 fill-primary-500' : 'text-gray-300',
            )}
          />
        </button>
      </div>
    </Link>
  );
}
