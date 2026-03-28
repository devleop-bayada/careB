import Rating from '@/components/ui/Rating';
import { cn } from '@/lib/utils';

interface ReviewStatsProps {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  healthCareSkillAverage?: number;
  className?: string;
}

export default function ReviewStats({ average, total, distribution, healthCareSkillAverage, className }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className={cn('flex gap-5 px-4 py-4 border-b border-gray-100', className)}>
      {/* Left: average */}
      <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
        <span className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</span>
        <Rating value={average} size="sm" />
        <span className="text-xs text-gray-400">{total}개 후기</span>
      </div>

      {/* Health care skill */}
      {healthCareSkillAverage !== undefined && (
        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
          <span className="text-2xl font-bold text-blue-600">{healthCareSkillAverage.toFixed(1)}</span>
          <Rating value={healthCareSkillAverage} size="sm" />
          <span className="text-xs text-gray-400">건강관리 능력</span>
        </div>
      )}

      {/* Right: distribution bars */}
      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star] ?? 0;
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-3 flex-shrink-0">{star}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
