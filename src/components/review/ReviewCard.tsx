import Avatar from '@/components/ui/Avatar';
import Rating from '@/components/ui/Rating';
import { cn } from '@/lib/utils';
import { ThumbsUp } from 'lucide-react';

interface ReviewCardProps {
  authorName: string;
  authorImage?: string | null;
  rating: number;
  date: string;
  content: string;
  healthCareSkill?: number;
  helpfulCount?: number;
  className?: string;
}

export default function ReviewCard({
  authorName,
  authorImage,
  rating,
  date,
  content,
  healthCareSkill,
  helpfulCount = 0,
  className,
}: ReviewCardProps) {
  return (
    <div className={cn('py-4 border-b border-gray-100', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Avatar src={authorImage} name={authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{authorName}</span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <Rating value={rating} size="sm" />
        </div>
      </div>
      {healthCareSkill !== undefined && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">건강관리 능력</span>
          <Rating value={healthCareSkill} size="sm" />
          <span className="text-xs font-medium text-gray-600">{healthCareSkill.toFixed(1)}</span>
        </div>
      )}
      <p className="text-sm text-gray-700 leading-relaxed mb-2">{content}</p>
      {helpfulCount > 0 && (
        <button type="button" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <ThumbsUp className="h-3.5 w-3.5" />
          도움이 됐어요 {helpfulCount}
        </button>
      )}
    </div>
  );
}
