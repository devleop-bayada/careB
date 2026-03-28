import { cn } from '@/lib/utils';

interface HomeBannerProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function HomeBanner({
  title = '믿을 수 있는 요양보호사를\n지금 바로 찾아보세요',
  subtitle = '바야다와 함께하는 어르신 돌봄',
  className,
}: HomeBannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden px-5 py-8',
        'bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500',
        className,
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />

      <div className="relative">
        <h1 className="text-2xl font-bold text-white leading-snug whitespace-pre-line mb-2">
          {title}
        </h1>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>
    </div>
  );
}
