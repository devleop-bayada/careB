import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { Clock, MapPin, MessageSquareText } from 'lucide-react';

interface CaregiverProfileHeaderProps {
  name: string;
  caregiverType: '방문요양' | '방문목욕' | '방문간호' | '주야간보호' | '단기보호';
  profileImage?: string | null;
  rating: number;
  reviewCount: number;
  region: string;
  specialties?: string[];
  lastLoginAt?: Date | string;
  responseRate?: number;
}

const caregiverTypeBadgeVariant = {
  '방문요양': 'primary',
  '방문목욕': 'blue',
  '방문간호': 'green',
  '주야간보호': 'red',
  '단기보호': 'gray',
} as const;

function formatLastLogin(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return '방금 전 접속';
  if (hours < 24) return `${hours}시간 전 접속`;
  return `${days}일 전 접속`;
}

export default function CaregiverProfileHeader({
  name,
  caregiverType,
  profileImage,
  rating,
  reviewCount,
  region,
  specialties = [],
  lastLoginAt,
  responseRate,
}: CaregiverProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center py-6 px-4 border-b border-gray-100">
      <Avatar src={profileImage} name={name} size="xl" className="mb-3" />

      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-xl font-bold text-gray-900">{name}</h1>
        <Badge variant={caregiverTypeBadgeVariant[caregiverType]} size="sm">
          {caregiverType}
        </Badge>
      </div>

      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {specialties.map((spec) => (
            <span key={spec} className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {spec}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 mb-3">
        <Rating value={rating} size="sm" />
        <span className="text-sm font-medium text-gray-700 ml-1">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-400">({reviewCount}개 후기)</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {region}
        </span>
        {lastLoginAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatLastLogin(lastLoginAt)}
          </span>
        )}
        {responseRate !== undefined && (
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            <MessageSquareText className="h-4 w-4" />
            응답률 {responseRate}%
          </span>
        )}
      </div>
    </div>
  );
}
