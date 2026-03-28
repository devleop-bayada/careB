"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import CustomSelect from "@/components/ui/CustomSelect";

const REGIONS = [
  { value: "", label: "지역 전체" },
  { value: "서울", label: "서울" },
  { value: "경기", label: "경기" },
  { value: "인천", label: "인천" },
  { value: "부산", label: "부산" },
];
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
        <CustomSelect
          value={searchParams.region || ""}
          onChange={(val) => updateFilter("region", val)}
          options={REGIONS}
          placeholder="지역 전체"
          size="sm"
        />
        <CustomSelect
          value={searchParams.sort || "createdAt"}
          onChange={(val) => updateFilter("sort", val)}
          options={SORT_OPTIONS}
          placeholder="정렬"
          size="sm"
        />
      </div>
    </div>
  );
}
