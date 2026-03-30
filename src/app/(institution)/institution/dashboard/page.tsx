"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, CreditCard, RefreshCw } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface DashboardData {
  staffCount: number;
  recipientCount: number;
  totalCareHours: number;
  claimTotal: number;
  claimCount: number;
  claimStatuses: { status: string; amount: number }[];
}

const CLAIM_STATUS_LABEL: Record<string, string> = {
  DRAFT: "작성중",
  SUBMITTED: "제출완료",
  REVIEWING: "심사중",
  APPROVED: "승인",
  REJECTED: "반려",
  PAID: "지급완료",
};

export default function InstitutionDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/institution/dashboard");
      if (!res.ok) throw new Error("데이터 로딩 실패");
      setData(await res.json());
    } catch (e: any) {
      setError(e.message ?? "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">{error || "데이터를 불러올 수 없습니다."}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg"
        >
          <RefreshCw size={14} /> 다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">기관 대시보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">기관 운영 현황을 한눈에 확인하세요</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          새로고침
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="소속 요양보호사"
          value={data.staffCount}
          unit="명"
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="이용자 수"
          value={data.recipientCount}
          unit="명"
          icon={<UserCheck size={18} />}
          color="green"
        />
        <StatCard
          title="이번 달 돌봄 시간"
          value={data.totalCareHours}
          unit="시간"
          icon={<Clock size={18} />}
          color="purple"
        />
        <StatCard
          title="급여 청구"
          value={data.claimTotal > 0 ? `${Math.round(data.claimTotal / 10000).toLocaleString()}만` : "0"}
          unit="원"
          subValue={`${data.claimCount}건 청구`}
          icon={<CreditCard size={18} />}
          color="orange"
        />
      </div>

      {/* 청구 현황 */}
      {data.claimStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">이번 달 청구 현황</h2>
          <div className="space-y-2">
            {data.claimStatuses.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {CLAIM_STATUS_LABEL[c.status] ?? c.status}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {c.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 안내 */}
      {data.staffCount === 0 && data.recipientCount === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm mb-2">아직 등록된 인력과 이용자가 없습니다.</p>
          <p className="text-gray-500 text-sm">
            <a href="/institution/staff/register" className="text-teal-600 font-medium hover:underline">
              인력 등록
            </a>
            {" 또는 "}
            <a href="/institution/recipients/register" className="text-teal-600 font-medium hover:underline">
              이용자 등록
            </a>
            을 시작해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
