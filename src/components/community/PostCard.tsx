'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PostCardProps {
  id: string;
  authorName: string;
  authorImage?: string | null;
  postedAt: Date | string;
  title: string;
  preview: string;
  thumbnail?: string | null;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  category: string;
}

export default function PostCard({
  id,
  authorName,
  authorImage,
  postedAt,
  title,
  preview,
  thumbnail,
  commentCount,
  likeCount,
  viewCount,
  category,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likeCount);

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/community/${id}/like`, { method: "POST" });
      if (res.ok) {
        if (liked) {
          setLikes((prev) => Math.max(0, prev - 1));
        } else {
          setLikes((prev) => prev + 1);
        }
        setLiked(!liked);
      }
    } catch {
      // ignore
    }
  }

  return (
    <Link href={`/community/${id}`}>
      <div className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar src={authorImage} name={authorName} size="sm" />
          <span className="text-sm font-medium text-gray-700">{authorName}</span>
          <Badge variant="gray" size="sm">{category}</Badge>
          <span className="text-xs text-gray-400 ml-auto">{formatRelativeDate(postedAt)}</span>
        </div>

        {/* Content */}
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-snug line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{preview}</p>
          </div>
          {thumbnail && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <Image src={thumbnail} alt="썸네일" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {commentCount}
          </span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-red-500' : ''}`} />
            {likes}
          </button>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
