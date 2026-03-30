"use client";

interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  title?: string;
  unit?: string;
  color?: string;
}

export default function BarChart({
  data,
  height = 160,
  title,
  unit = "",
  color = "#6366f1",
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>}
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((point, idx) => {
          const barHeight = (point.value / maxValue) * (height - 24);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* 툴팁 */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {point.value.toLocaleString()}{unit}
              </div>
              {/* 바 */}
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: barHeight,
                  backgroundColor: point.color ?? color,
                  minHeight: point.value > 0 ? 2 : 0,
                }}
              />
              {/* 레이블 */}
              <span className="text-[9px] text-gray-400 truncate w-full text-center">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
