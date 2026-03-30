"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";

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

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [previousReports, setPreviousReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState("");
  const [targetAction, setTargetAction] = useState("");
  const [processing, setProcessing] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReport(data.report);
      setPreviousReports(data.previousReports);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReport(); }, [id]);

  async function handleStatusChange(status: string) {
    if (status === "RESOLVED" && !resolution) {
      alert("처리 사유를 입력해주세요.");
      return;
    }
    setProcessing(true);
    try {
      await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution, targetAction: targetAction || undefined }),
      });
      fetchReport();
      setResolution("");
      setTargetAction("");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-16 text-gray-400">신고를 찾을 수 없습니다.</div>;
  }

  const isUrgent = ["FRAUD", "HARASSMENT"].includes(report.type) && report.status === "PENDING";
  const canProcess = report.status === "PENDING" || report.status === "INVESTIGATING";

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">신고 상세</h1>
            {isUrgent && (
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500 text-white">긴급</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(report.createdAt).toLocaleString("ko-KR")} 접수
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLOR[report.status] ?? "bg-gray-100 text-gray-500"}`}>
          {REPORT_STATUS[report.status] ?? report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 신고 내용 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 신고 정보 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">신고 내용</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-400 mb-1">유형</dt>
                <dd className="text-sm font-medium text-gray-900">{REPORT_TYPE[report.type] ?? report.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 mb-1">상태</dt>
                <dd className="text-sm font-medium text-gray-900">{REPORT_STATUS[report.status] ?? report.status}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs text-gray-400 mb-1">사유</dt>
              <dd className="text-sm text-gray-900">{report.reason}</dd>
            </div>
            {report.description && (
              <div>
                <dt className="text-xs text-gray-400 mb-1">상세 설명</dt>
                <dd className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{report.description}</dd>
              </div>
            )}
            {report.resolution && (
              <div>
                <dt className="text-xs text-gray-400 mb-1">처리 결과</dt>
                <dd className="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 rounded-lg p-3">{report.resolution}</dd>
              </div>
            )}
            {report.resolvedAt && (
              <p className="text-xs text-gray-400">
                처리일: {new Date(report.resolvedAt).toLocaleString("ko-KR")}
              </p>
            )}
          </div>

          {/* 처리 폼 */}
          {canProcess && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">처리</h2>

              {report.status === "PENDING" && (
                <button
                  onClick={() => handleStatusChange("INVESTIGATING")}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Search size={14} /> 조사 시작
                </button>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">처리 사유</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="처리 사유를 입력해주세요..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">대상자 제재</label>
                <select
                  value={targetAction}
                  onChange={(e) => setTargetAction(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                >
                  <option value="">제재 없음</option>
                  <option value="warn">경고</option>
                  <option value="ban">계정 정지</option>
                  <option value="deactivate">계정 해지</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleStatusChange("RESOLVED")}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  <CheckCircle size={14} /> 해결 처리
                </button>
                <button
                  onClick={() => {
                    if (confirm("이 신고를 기각하시겠습니까?")) {
                      handleStatusChange("DISMISSED");
                    }
                  }}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircle size={14} /> 기각
                </button>
              </div>
            </div>
          )}

          {/* 이전 신고 이력 */}
          {previousReports.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">
                대상자 이전 신고 이력 ({previousReports.length}건)
              </h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">유형</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">사유</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">상태</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">접수일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {previousReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">{REPORT_TYPE[r.type] ?? r.type}</td>
                      <td className="px-4 py-2 text-gray-500 max-w-[200px] truncate">{r.reason}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {REPORT_STATUS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 오른쪽: 신고자/대상자 정보 */}
        <div className="space-y-4">
          {/* 신고자 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">신고자</h2>
            <div className="space-y-2">
              <div>
                <dt className="text-xs text-gray-400">이름</dt>
                <dd className="text-sm font-medium text-gray-900">{report.reporter.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">역할</dt>
                <dd className="text-sm text-gray-700">{ROLE_LABEL[report.reporter.role] ?? report.reporter.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">이메일</dt>
                <dd className="text-sm text-gray-700">{report.reporter.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">전화번호</dt>
                <dd className="text-sm text-gray-700">{report.reporter.phone}</dd>
              </div>
              <button
                onClick={() => router.push(`/admin/members/${report.reporter.id}`)}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                프로필 보기 →
              </button>
            </div>
          </div>

          {/* 대상자 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">대상자</h2>
            <div className="space-y-2">
              <div>
                <dt className="text-xs text-gray-400">이름</dt>
                <dd className="text-sm font-medium text-gray-900">{report.target.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">역할</dt>
                <dd className="text-sm text-gray-700">{ROLE_LABEL[report.target.role] ?? report.target.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">이메일</dt>
                <dd className="text-sm text-gray-700">{report.target.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">전화번호</dt>
                <dd className="text-sm text-gray-700">{report.target.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">계정 상태</dt>
                <dd className="text-sm">
                  {report.target.isBanned ? (
                    <span className="text-red-600 font-semibold">정지됨</span>
                  ) : !report.target.isActive ? (
                    <span className="text-gray-500 font-semibold">비활성</span>
                  ) : (
                    <span className="text-green-600 font-semibold">활성</span>
                  )}
                </dd>
              </div>
              <button
                onClick={() => router.push(`/admin/members/${report.target.id}`)}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                프로필 보기 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
