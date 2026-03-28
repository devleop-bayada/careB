import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm', px: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', px: 40 },
  lg: { container: 'w-14 h-14', text: 'text-lg', px: 56 },
  xl: { container: 'w-20 h-20', text: 'text-2xl', px: 80 },
};

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { container, text, px } = sizeStyles[size];
  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0 bg-primary-100 flex items-center justify-center',
        container,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? '프로필'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className={cn('font-semibold text-primary-600 select-none', text)}>
          {initials}
        </span>
      )}
    </div>
  );
}
