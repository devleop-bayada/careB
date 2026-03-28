"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

const REGIONS = ["서울", "경기", "인천", "부산"];
const CARE_TYPES = [
  { value: "", label: "전체" },
  { value: "HOME_CARE", label: "방문요양" },
  { value: "HOME_BATH", label: "방문목욕" },
  { value: "HOME_NURSING", label: "방문간호" },
  { value: "DAY_NIGHT_CARE", label: "주야간보호" },
  { value: "SHORT_TERM_CARE", label: "단기보호" },
  { value: "HOURLY_CARE", label: "시간제돌봄" },
  { value: "HOSPITAL_CARE", label: "병원간병" },
  { value: "DEMENTIA_CARE", label: "치매전문" },
  { value: "HOSPICE_CARE", label: "임종돌봄" },
];
const CAREGIVER_TYPES = [
  { value: "", label: "전체" },
  { value: "CARE_WORKER", label: "요양보호사" },
  { value: "NURSING_ASSISTANT", label: "간호조무사" },
  { value: "SOCIAL_WORKER", label: "사회복지사" },
  { value: "NURSE", label: "간호사" },
];
const SPECIALTY_TYPES = [
  { value: "", label: "전문분야 전체" },
  { value: "치매케어", label: "치매케어" },
  { value: "재활케어", label: "재활케어" },
  { value: "야간케어", label: "야간케어" },
  { value: "식사보조", label: "식사보조" },
  { value: "이동보조", label: "이동보조" },
];
const GRADE_OPTIONS = [
  { value: "", label: "등급 전체" },
  { value: "신입", label: "신입" },
  { value: "일반", label: "일반" },
  { value: "숙련", label: "숙련" },
  { value: "전문", label: "전문" },
  { value: "마스터", label: "마스터" },
];
const SORT_OPTIONS = [
  { value: "updatedAt", label: "최근 업데이트순" },
  { value: "rating", label: "평점 높은순" },
];

export default function CaregiverSearchFilters({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams as any);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-2">
      {/* Care Type chips */}
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
      {/* Second row: region + caregiver type + sort */}
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
          value={searchParams.caregiverType || ""}
          onChange={(e) => updateFilter("caregiverType", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          {CAREGIVER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          value={searchParams.sort || "updatedAt"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {/* Third row: specialty + grade */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <select
          value={searchParams.specialty || ""}
          onChange={(e) => updateFilter("specialty", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          {SPECIALTY_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={searchParams.grade || ""}
          onChange={(e) => updateFilter("grade", e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
        >
          {GRADE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>
    </div>
  );
}
