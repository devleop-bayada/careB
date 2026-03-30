"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pin, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  target: string;
  status: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  author: { name: string };
}

const TARGET_LABEL: Record<string, string> = {
  ALL: "전체",
  GUARDIAN: "보호자",
  CAREGIVER: "요양보호사",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "게시중",
  SCHEDULED: "예약",
  EXPIRED: "종료",
  DRAFT: "임시저장",
};

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  DRAFT: "bg-yellow-100 text-yellow-700",
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [target, setTarget] = useState("");
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");

  async function fetchNotices() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (target) params.set("target", target);
    if (q) params.set("q", q);

    const res = await fetch(`/api/admin/notices?${params}`);
    const data = await res.json();
    setNotices(data.notices ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotices();
  }, [page, status, target, q]);

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    fetchNotices();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">공지사항 관리</h1>
          <p className="text-sm text-gray-400">전체 {total.toLocaleString()}건</p>
        </div>
        <Link
          href="/admin/content/notices/write"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          새 공지 작성
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">전체 상태</option>
          <option value="PUBLISHED">게시중</option>
          <option value="SCHEDULED">예약</option>
          <option value="EXPIRED">종료</option>
          <option value="DRAFT">임시저장</option>
        </select>
        <select
          value={target}
          onChange={(e) => { setTarget(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">전체 대상</option>
          <option value="ALL">전체</option>
          <option value="GUARDIAN">보호자</option>
          <option value="CAREGIVER">요양보호사</option>
        </select>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목 검색"
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            검색
          </button>
        </form>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-6"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">대상</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">조회수</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">작성일</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">작성자</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    공지사항이 없습니다.
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      {notice.isPinned && (
                        <Pin size={13} className="text-orange-400" fill="currentColor" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-xs truncate">
                      {notice.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {TARGET_LABEL[notice.target] ?? notice.target}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_COLOR[notice.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABEL[notice.status] ?? notice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {notice.viewCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{notice.author?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/content/notices/${notice.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {page} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
