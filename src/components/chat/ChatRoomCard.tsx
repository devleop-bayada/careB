import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatRoomCardProps {
  id: string;
  otherPartyName: string;
  otherPartyImage?: string | null;
  lastMessage: string;
  lastMessageAt: Date | string;
  unreadCount: number;
  careType?: string;
  className?: string;
}

export default function ChatRoomCard({
  id,
  otherPartyName,
  otherPartyImage,
  lastMessage,
  lastMessageAt,
  unreadCount,
  careType,
  className,
}: ChatRoomCardProps) {
  return (
    <Link href={`/chat/${id}`}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors',
        className,
      )}>
        <Avatar src={otherPartyImage} name={otherPartyName} size="md" className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{otherPartyName}</span>
            {careType && <Badge variant="primary" size="sm">{careType}</Badge>}
          </div>
          <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400">{formatRelativeDate(lastMessageAt)}</span>
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
