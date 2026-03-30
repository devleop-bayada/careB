"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface ReportItem {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { name: string; role: string };
  target: { name: string; role: string };
}

const REPORT_TYPE: Record<string, string> = {
  INAPPROPRIATE_BEHAVIOR: "부적절한 행동",
  NO_SHOW: "노쇼",
  FRAUD: "사기",
  HARASSMENT: "괴롭힘",
  QUALITY_ISSUE: "서비스 품질",
  OTHER: "기타",
};

const REPORT_STATUS: Record<string, string> = {
  PENDING: "대기",
  INVESTIGATING: "조사중",
  RESOLVED: "해결",
  DISMISSED: "기각",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  INVESTIGATING: "bg-blue-50 text-blue-600",
  RESOLVED: "bg-green-50 text-green-600",
  DISMISSED: "bg-gray-100 text-gray-500",
};

const ROLE_LABEL: Record<string, string> = {
  GUARDIAN: "보호자",
  CAREGIVER: "요양보호사",
  ADMIN: "관리자",
  INSTITUTION: "기관",
};

// 긴급 유형: 사기, 괴롭힘
const URGENT_TYPES = ["FRAUD", "HARASSMENT"];

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReports(); }, [page, statusFilter, typeFilter, fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-black text-gray-900">신고/분쟁 처리</h1>
        <p className="text-sm text-gray-400 mt-0.5">전체 {total}건의 신고를 관리합니다.</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
        >
          <option value="">상태 전체</option>
          <option value="PENDING">대기</option>
          <option value="INVESTIGATING">조사중</option>
          <option value="RESOLVED">해결</option>
          <option value="DISMISSED">기각</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
        >
          <option value="">유형 전체</option>
          {Object.entries(REPORT_TYPE).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
        <span className="text-gray-400 text-sm">~</span>
        <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">신고자</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">대상자</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">유형</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">사유</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">접수일</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">신고 데이터가 없습니다.</td>
                </tr>
              ) : (
                reports.map((r) => {
                  const isUrgent = URGENT_TYPES.includes(r.type) && r.status === "PENDING";
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50/50 ${isUrgent ? "bg-red-50/30" : ""}`}>
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{r.reporter.name}</span>
                          <span className="ml-1 text-xs text-gray-400">{ROLE_LABEL[r.reporter.role] ?? r.reporter.role}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{r.target.name}</span>
                          <span className="ml-1 text-xs text-gray-400">{ROLE_LABEL[r.target.role] ?? r.target.role}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {isUrgent && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500 text-white">긴급</span>
                          )}
                          <span>{REPORT_TYPE[r.type] ?? r.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{r.reason}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {REPORT_STATUS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => router.push(`/admin/reports/${r.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500"
                          title="상세 보기"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
