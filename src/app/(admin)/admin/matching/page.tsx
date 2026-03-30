"use client";

import { useEffect, useState } from "react";
import { GitMerge, Clock, TrendingUp, Zap, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface MatchItem {
  id: string;
  status: string;
  serviceCategory: string;
  createdAt: string;
  startDate: string;
  guardian: { region: string; user: { name: string } };
  caregiver: { user: { name: string } };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  ACCEPTED: "수락",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  ACCEPTED: "bg-blue-50 text-blue-600",
  CONFIRMED: "bg-indigo-50 text-indigo-600",
  IN_PROGRESS: "bg-green-50 text-green-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const STATUS_OPTIONS = [
  { key: "", label: "전체" },
  { key: "PENDING", label: "대기" },
  { key: "ACCEPTED", label: "수락" },
  { key: "CONFIRMED", label: "확정" },
  { key: "IN_PROGRESS", label: "진행중" },
  { key: "COMPLETED", label: "완료" },
  { key: "CANCELLED", label: "취소" },
];

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [stats, setStats] = useState({ activeCount: 0, todayNewCount: 0, successRate: 0, avgResponseHours: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [region, setRegion] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);
      if (region) params.set("region", region);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/matching?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMatches(data.matches);
      setStats(data.stats);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [page, statusFilter, region, fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-black text-gray-900">매칭 모니터링</h1>
        <p className="text-sm text-gray-400 mt-0.5">전체 매칭 현황을 모니터링합니다.</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="진행 중 매칭"
          value={stats.activeCount}
          icon={<GitMerge size={18} />}
          color="blue"
        />
        <StatCard
          title="오늘 신규 요청"
          value={stats.todayNewCount}
          icon={<Zap size={18} />}
          color="green"
        />
        <StatCard
          title="매칭 성공률"
          value={`${stats.successRate}%`}
          subValue="목표 85%"
          icon={<TrendingUp size={18} />}
          color={stats.successRate >= 85 ? "green" : "orange"}
        />
        <StatCard
          title="평균 응답 시간"
          value={`${stats.avgResponseHours}`}
          unit="시간"
          icon={<Clock size={18} />}
          color="purple"
        />
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="지역 검색"
          value={region}
          onChange={(e) => { setRegion(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        />
        <span className="text-gray-400 text-sm">~</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">보호자</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">요양보호사</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">서비스</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">지역</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">요청일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">매칭 데이터가 없습니다.</td>
                </tr>
              ) : (
                matches.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{m.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{m.guardian.user.name}</td>
                    <td className="px-5 py-3 text-gray-700">{m.caregiver.user.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLOR[m.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{m.serviceCategory}</td>
                    <td className="px-5 py-3 text-gray-500">{m.guardian.region || "-"}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(m.createdAt).toLocaleDateString("ko-KR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{total}건</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
