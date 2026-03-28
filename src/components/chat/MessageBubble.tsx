import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  time: string;
  imageUrl?: string | null;
  className?: string;
}

export default function MessageBubble({ content, isOwn, time, imageUrl, className }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start', className)}>
      {imageUrl ? (
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden">
          <Image src={imageUrl} alt="이미지" fill className="object-cover" />
        </div>
      ) : (
        <div
          className={cn(
            'max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-primary-100 text-gray-900 rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm',
          )}
        >
          {content}
        </div>
      )}
      <span className="text-[10px] text-gray-400 px-1">{time}</span>
    </div>
  );
}
