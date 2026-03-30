"use client";

import { useRouter, usePathname } from "next/navigation";

const GUARDIAN_CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "PARENTING", label: "돌봄 경험담" },
  { value: "EDUCATION", label: "요양 정보" },
  { value: "QNA", label: "질문/답변" },
  { value: "FREE", label: "자유" },
];

const CAREGIVER_CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "CARE_KNOWHOW", label: "케어 노하우" },
  { value: "CASE_QNA", label: "사례 Q&A" },
  { value: "POLICY", label: "제도/법률" },
  { value: "JOB", label: "일자리" },
  { value: "FREE", label: "자유" },
];

export default function CommunityTabs({
  activeCategory,
  role,
}: {
  activeCategory: string;
  role?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const categories = role === "CAREGIVER" ? CAREGIVER_CATEGORIES : GUARDIAN_CATEGORIES;

  return (
    <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => router.push(`${pathname}?category=${cat.value}`)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            activeCategory === cat.value
              ? "bg-primary-500 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
