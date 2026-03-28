'use client';

import Avatar from '@/components/ui/Avatar';
import { formatRelativeDate } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface CommentItemProps {
  id: string;
  authorName: string;
  authorImage?: string | null;
  postedAt: Date | string;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export default function CommentItem({
  id,
  authorName,
  authorImage,
  postedAt,
  content,
  likeCount,
  isLiked = false,
  onLike,
}: CommentItemProps) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);

  function handleLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : c - 1));
    onLike?.(id);
  }

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100">
      <Avatar src={authorImage} name={authorName} size="sm" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-800">{authorName}</span>
          <span className="text-xs text-gray-400">{formatRelativeDate(postedAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      </div>
      <button
        type="button"
        onClick={handleLike}
        className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${liked ? 'text-red-400 fill-red-400' : 'text-gray-300'}`}
        />
        {count > 0 && <span className="text-[10px] text-gray-400">{count}</span>}
      </button>
    </div>
  );
}
