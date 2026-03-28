"use client";

import { useRouter, usePathname } from "next/navigation";

const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "PARENTING", label: "돌봄이야기" },
  { value: "EDUCATION", label: "요양정보" },
  { value: "CAREGIVER", label: "요양보호사이야기" },
  { value: "QNA", label: "질문/상담" },
  { value: "POLICY", label: "제도안내" },
  { value: "HEALTH", label: "건강정보" },
];

export default function CommunityTabs({ activeCategory }: { activeCategory: string }) {
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
