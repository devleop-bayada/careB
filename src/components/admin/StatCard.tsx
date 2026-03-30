import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number; // 전 기간 대비 % (양수=증가, 음수=감소)
  unit?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
};

export default function StatCard({
  title,
  value,
  subValue,
  change,
  unit,
  icon,
  color = "blue",
}: StatCardProps) {
  const isIncrease = change !== undefined && change > 0;
  const isDecrease = change !== undefined && change < 0;
  const isFlat = change !== undefined && change === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm text-gray-400 mb-0.5">{unit}</span>}
      </div>

      <div className="flex items-center gap-2">
        {change !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isIncrease ? "text-green-600" : isDecrease ? "text-red-500" : "text-gray-400"
            }`}
          >
            {isIncrease && <TrendingUp size={13} />}
            {isDecrease && <TrendingDown size={13} />}
            {isFlat && <Minus size={13} />}
            <span>
              {isIncrease ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        )}
        {subValue && <span className="text-xs text-gray-400">{subValue}</span>}
      </div>
    </div>
  );
}
