"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

const CATEGORIES = [
  { value: "PARENTING", label: "돌봄이야기" },
  { value: "EDUCATION", label: "요양정보" },
  { value: "CAREGIVER", label: "요양보호사이야기" },
  { value: "QNA", label: "질문/상담" },
  { value: "POLICY", label: "제도안내" },
  { value: "HEALTH", label: "건강정보" },
];

export default function CommunityWritePage() {
  const router = useRouter();
  const [category, setCategory] = useState("PARENTING");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "게시글 작성에 실패했습니다.");
        setLoading(false);
        return;
      }
      const post = await res.json();
      router.push(`/community/${post.id}`);
    } catch {
      setError("게시글 작성 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="글쓰기" fallbackHref="/community" />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 py-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                  category === cat.value
                    ? "border-primary-400 bg-primary-500 text-white"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className="w-full text-base font-bold text-gray-900 placeholder-gray-300 border-0 border-b border-gray-100 py-3 focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            rows={12}
            className="w-full text-sm text-gray-700 placeholder-gray-300 border-0 py-2 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Image Upload */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ImageIcon size={18} />
            사진 추가
          </button>
        </div>
      </form>
    </div>
  );
}
