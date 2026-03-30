"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, GitMerge, CreditCard, TrendingUp, RefreshCw } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import BarChart from "@/components/admin/BarChart";

interface DashboardData {
  summary: {
    totalUsers: number;
    guardianCount: number;
    caregiverCount: number;
    newUsersThisMonth: number;
    newUserChange: number;
    activeMatchCount: number;
    completedMatchCount: number;
    totalMatchCount: number;
    matchingSuccessRate: number;
    thisMonthAmount: number;
    lastMonthAmount: number;
    paymentChange: number;
  };
  charts: {
    signupTrend: { labels: string[]; values: number[] };
    matchDistribution: { status: string; count: number }[];
  };
  lastUpdated: string;
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
  PENDING: "#f59e0b",
  ACCEPTED: "#3b82f6",
  CONFIRMED: "#6366f1",
  IN_PROGRESS: "#10b981",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics/kpi");
      if (!res.ok) throw new Error("데이터 로딩 실패");
      const json = await res.json();
      setData(json);
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
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">{error || "데이터를 불러올 수 없습니다."}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
        >
          <RefreshCw size={14} /> 다시 시도
        </button>
      </div>
    );
  }

  const { summary, charts } = data;

  const signupChartData = charts.signupTrend.labels.map((label, i) => ({
    label,
    value: charts.signupTrend.values[i],
  }));

  const matchChartData = charts.matchDistribution.map((m) => ({
    label: STATUS_LABEL[m.status] ?? m.status,
    value: m.count,
    color: STATUS_COLOR[m.status],
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">분석 대시보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            최종 업데이트: {new Date(data.lastUpdated).toLocaleString("ko-KR")}
          </p>
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
          title="전체 회원"
          value={summary.totalUsers}
          subValue={`보호자 ${summary.guardianCount.toLocaleString()} · 요양보호사 ${summary.caregiverCount.toLocaleString()}`}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="이번 달 신규 가입"
          value={summary.newUsersThisMonth}
          change={summary.newUserChange}
          subValue="전월 대비"
          icon={<UserCheck size={18} />}
          color="green"
        />
        <StatCard
          title="활성 매칭"
          value={summary.activeMatchCount}
          subValue={`완료 ${summary.completedMatchCount.toLocaleString()}건 · 전체 ${summary.totalMatchCount.toLocaleString()}건`}
          icon={<GitMerge size={18} />}
          color="purple"
        />
        <StatCard
          title="이번 달 거래액"
          value={`${Math.round(summary.thisMonthAmount / 10000).toLocaleString()}만`}
          unit="원"
          change={summary.paymentChange}
          subValue="전월 대비"
          icon={<CreditCard size={18} />}
          color="orange"
        />
        <StatCard
          title="매칭 성공률"
          value={`${summary.matchingSuccessRate}%`}
          subValue="목표 85%"
          icon={<TrendingUp size={18} />}
          color={summary.matchingSuccessRate >= 85 ? "green" : "orange"}
        />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 일별 가입자 추이 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">일별 신규 가입자 (최근 30일)</h2>
          <BarChart
            data={signupChartData}
            height={180}
            color="#6366f1"
            unit="명"
          />
        </div>

        {/* 매칭 상태 분포 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">매칭 상태 분포</h2>
          {matchChartData.length > 0 ? (
            <>
              <BarChart data={matchChartData} height={180} unit="건" />
              <div className="mt-3 flex flex-wrap gap-2">
                {matchChartData.map((m) => (
                  <div key={m.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.label}: {m.value.toLocaleString()}건
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 요약 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">회원 현황 요약</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">구분</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">수</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">비율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">전체 회원</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                  {summary.totalUsers.toLocaleString()}명
                </td>
                <td className="px-5 py-3 text-right text-gray-400">100%</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-600 pl-8">보호자</td>
                <td className="px-5 py-3 text-right text-gray-900">
                  {summary.guardianCount.toLocaleString()}명
                </td>
                <td className="px-5 py-3 text-right text-gray-400">
                  {summary.totalUsers > 0
                    ? Math.round((summary.guardianCount / summary.totalUsers) * 100)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-600 pl-8">요양보호사</td>
                <td className="px-5 py-3 text-right text-gray-900">
                  {summary.caregiverCount.toLocaleString()}명
                </td>
                <td className="px-5 py-3 text-right text-gray-400">
                  {summary.totalUsers > 0
                    ? Math.round((summary.caregiverCount / summary.totalUsers) * 100)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">이번 달 신규</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                  {summary.newUsersThisMonth.toLocaleString()}명
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`text-xs font-semibold ${
                      summary.newUserChange >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {summary.newUserChange >= 0 ? "+" : ""}
                    {summary.newUserChange}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
