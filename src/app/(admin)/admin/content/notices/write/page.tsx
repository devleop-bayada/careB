"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

export default function NoticeWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("ALL");
  const [isPinned, setIsPinned] = useState(false);
  const [publishType, setPublishType] = useState<"IMMEDIATE" | "SCHEDULED" | "DRAFT">("IMMEDIATE");
  const [publishAt, setPublishAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(saveAs: "PUBLISHED" | "DRAFT") {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }

    if (publishType === "SCHEDULED" && !publishAt) {
      setError("예약 게시 시간을 선택해주세요.");
      return;
    }

    if (publishAt && new Date(publishAt) < new Date()) {
      setError("예약 시간은 현재 시간 이후로 설정해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          target,
          isPinned,
          status: saveAs === "DRAFT" ? "DRAFT" : publishType === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED",
          publishAt: publishType === "SCHEDULED" ? publishAt : null,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장 실패");
        return;
      }
      router.push("/admin/content/notices");
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/content/notices"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-black text-gray-900">새 공지 작성</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="공지사항 제목을 입력하세요 (최대 100자)"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        {/* 대상 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">노출 대상</label>
          <div className="flex gap-4">
            {[
              { value: "ALL", label: "전체" },
              { value: "GUARDIAN", label: "보호자만" },
              { value: "CAREGIVER", label: "요양보호사만" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value={opt.value}
                  checked={target === opt.value}
                  onChange={(e) => setTarget(e.target.value)}
                  className="accent-primary-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="공지사항 내용을 입력하세요"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y"
          />
        </div>

        {/* 상단 고정 */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setIsPinned(!isPinned)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                isPinned ? "bg-primary-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${
                  isPinned ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">상단 고정 (최대 3개)</span>
          </label>
        </div>

        {/* 게시 설정 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">게시 설정</label>
          <div className="space-y-2">
            {[
              { value: "IMMEDIATE", label: "즉시 게시" },
              { value: "SCHEDULED", label: "예약 게시" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishType"
                  value={opt.value}
                  checked={publishType === opt.value}
                  onChange={(e) => setPublishType(e.target.value as any)}
                  className="accent-primary-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          {publishType === "SCHEDULED" && (
            <div className="mt-3">
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          )}
        </div>

        {/* 게시 종료일 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            게시 종료일 <span className="text-gray-400 font-normal">(선택, 미설정 시 무기한)</span>
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => handleSubmit("DRAFT")}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-60"
        >
          <Save size={15} />
          임시저장
        </button>
        <button
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-60"
        >
          <Send size={15} />
          {submitting ? "저장 중..." : "게시하기"}
        </button>
      </div>
    </div>
  );
}
