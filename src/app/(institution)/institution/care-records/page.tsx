"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, ClipboardList } from "lucide-react";

interface CareRecord {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  caregiverName: string;
  recipientNames: string[];
  totalHours: number | null;
  journal: {
    id: string;
    title: string;
    content: string;
    mood: string | null;
    activities: string;
    createdAt: string;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "예정",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-500",
};

export default function InstitutionCareRecordsPage() {
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    recipientName: "",
  });

  async function fetchRecords(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.recipientName) params.set("recipientName", filters.recipientName);

      const res = await fetch(`/api/institution/care-records?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records ?? []);
        setTotal(data.total ?? 0);
        setPage(data.page ?? 1);
        setTotalPages(data.totalPages ?? 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    fetchRecords(1);
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">돌봄기록</h1>
          <p className="text-sm text-gray-400 mt-0.5">전체 돌봄일지 통합 조회 (총 {total}건)</p>
        </div>
        <button
          onClick={() => fetchRecords(page)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          새로고침
        </button>
      </div>

      {/* 필터 */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">시작일</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">종료일</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">이용자 이름</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.recipientName}
              onChange={(e) => setFilters({ ...filters, recipientName: e.target.value })}
              placeholder="이름 검색..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
        >
          조회
        </button>
      </form>

      {/* 기록 목록 */}
      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">조건에 맞는 돌봄 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(r.scheduledDate).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {r.startTime} ~ {r.endTime}
                    </span>
                    {r.totalHours && (
                      <span className="text-xs text-gray-400">({r.totalHours}시간)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>요양보호사: {r.caregiverName}</span>
                    <span className="text-gray-300">|</span>
                    <span>이용자: {r.recipientNames.join(", ") || "-"}</span>
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>

              {/* 일지 */}
              {r.journal ? (
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">{r.journal.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{r.journal.content}</p>
                  {r.journal.mood && (
                    <p className="text-xs text-gray-400 mt-1">기분: {r.journal.mood}</p>
                  )}
                </div>
              ) : (
                r.status === "COMPLETED" && (
                  <div className="bg-yellow-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-yellow-700 font-medium">일지 미작성</p>
                  </div>
                )
              )}
            </div>
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchRecords(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => fetchRecords(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
