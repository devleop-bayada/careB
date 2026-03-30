"use client";

import { useRouter, usePathname } from "next/navigation";

const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "REQUIRED", label: "필수 교육" },
  { value: "ADVANCED", label: "전문 심화" },
  { value: "PRACTICAL", label: "실무" },
  { value: "EMOTIONAL", label: "정서/소통" },
];

export default function EducationCategoryTabs({ activeCategory }: { activeCategory: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-hide">
      {CATEGORIES.map((cat) => (
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
