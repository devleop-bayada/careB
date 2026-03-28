"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

const REGIONS = ["서울", "경기", "인천", "부산"];
const CARE_TYPES = [
  { value: "", label: "전체" },
  { value: "HOME_CARE", label: "방문요양" },
  { value: "BATH_CARE", label: "방문목욕" },
  { value: "NURSING", label: "방문간호" },
  { value: "COGNITIVE", label: "인지활동" },
  { value: "HOUSEKEEPING", label: "가사지원" },
];
const SORT_OPTIONS = [
  { value: "createdAt", label: "최신순" },
  { value: "hourlyRate", label: "시급높은순" },
];

export default function GuardianSearchFilters({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams as any);
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CARE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => updateFilter("careType", t.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              (searchParams.careType || "") === t.value
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <select
          value={searchParams.region || ""}
          onChange={(e) => updateFilter("region", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          <option value="">지역 전체</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={searchParams.sort || "createdAt"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
