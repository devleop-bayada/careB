"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

export default function NoticeEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("ALL");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");
  const [publishAt, setPublishAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/notices/${id}`)
      .then((r) => r.json())
      .then(({ notice }) => {
        if (!notice) { setError("공지사항을 찾을 수 없습니다."); return; }
        setTitle(notice.title);
        setContent(notice.content);
        setTarget(notice.target);
        setIsPinned(notice.isPinned);
        setStatus(notice.status);
        setPublishAt(notice.publishAt ? notice.publishAt.slice(0, 16) : "");
        setExpiresAt(notice.expiresAt ? notice.expiresAt.slice(0, 16) : "");
      })
      .catch(() => setError("데이터 로딩 실패"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(saveStatus: string) {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          target,
          isPinned,
          status: saveStatus,
          publishAt: publishAt || null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "저장 실패"); return; }
      router.push("/admin/content/notices");
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/content/notices" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-black text-gray-900">공지사항 수정</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y"
          />
        </div>

        <div className="flex items-center gap-3">
          <div
            onClick={() => setIsPinned(!isPinned)}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${isPinned ? "bg-primary-500" : "bg-gray-200"}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${isPinned ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">상단 고정</span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">예약 게시 시간</label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            게시 종료일 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

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
          {submitting ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
