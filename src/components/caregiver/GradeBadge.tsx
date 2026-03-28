import { cn } from "@/lib/utils";

const GRADES = [
  { name: "신입", minPoints: 0, color: "bg-gray-100 text-gray-600", barColor: "bg-gray-400" },
  { name: "일반", minPoints: 100, color: "bg-blue-100 text-blue-600", barColor: "bg-blue-400" },
  { name: "숙련", minPoints: 300, color: "bg-green-100 text-green-600", barColor: "bg-green-400" },
  { name: "전문", minPoints: 600, color: "bg-purple-100 text-purple-600", barColor: "bg-purple-400" },
  { name: "마스터", minPoints: 1000, color: "bg-primary-100 text-primary-600", barColor: "bg-primary-400" },
];

export function getGrade(points: number = 0) {
  let grade = GRADES[0];
  for (const g of GRADES) {
    if (points >= g.minPoints) grade = g;
  }
  return grade;
}

export function getNextGrade(points: number = 0) {
  for (const g of GRADES) {
    if (points < g.minPoints) return g;
  }
  return null;
}

export default function GradeBadge({
  points = 0,
  showProgress = false,
  className,
}: {
  points?: number;
  showProgress?: boolean;
  className?: string;
}) {
  const grade = getGrade(points);
  const nextGrade = getNextGrade(points);

  const progress = nextGrade
    ? ((points - grade.minPoints) / (nextGrade.minPoints - grade.minPoints)) * 100
    : 100;

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", grade.color)}>
        {grade.name}
      </span>
      {showProgress && (
        <div className="mt-1.5 w-full">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", grade.barColor)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-gray-400">{points}점</span>
            {nextGrade && (
              <span className="text-[9px] text-gray-400">{nextGrade.minPoints}점</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
