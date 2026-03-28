"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function CommunitySearch({
  initialQuery,
  initialSort,
}: {
  initialQuery: string;
  initialSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleSort() {
    const params = new URLSearchParams(window.location.search);
    const newSort = initialSort === "latest" ? "popular" : "latest";
    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </form>
      <button
        onClick={toggleSort}
        className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
          initialSort === "popular"
            ? "bg-primary-500 text-white border-primary-500"
            : "bg-white text-gray-600 border-gray-200"
        }`}
      >
        {initialSort === "popular" ? "인기순" : "최신순"}
      </button>
    </div>
  );
}
