"use client";

import { useRouter, usePathname } from "next/navigation";

const TABS = [
  { value: "SCHEDULED", label: "예정" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
];

export default function CareTabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex border-b border-gray-100 -mx-4 px-4">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => router.push(`${pathname}?tab=${tab.value}`)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === tab.value
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-gray-400"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
