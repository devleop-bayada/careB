"use client";

import { useEffect, useState } from "react";
import { RefreshCw, FileText, Star, MapPin, Users } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface QualityData {
  journalSubmissionRate: number;
  averageRating: number;
  gpsComplianceRate: number;
  totalSessions: number;
  completedSessions: number;
  journalCount: number;
  staffCount: number;
}

export default function InstitutionQualityPage() {
  const [data, setData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/institution/quality");
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
          <h1 className="text-xl font-black text-gray-900">품질관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">최근 3개월 서비스 품질 현황</p>
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
          title="일지 제출율"
          value={`${data.journalSubmissionRate}%`}
          subValue={`${data.journalCount}건 / ${data.completedSessions}건`}
          icon={<FileText size={18} />}
          color={data.journalSubmissionRate >= 80 ? "green" : "orange"}
        />
        <StatCard
          title="평균 평점"
          value={data.averageRating.toFixed(1)}
          subValue="5.0 만점"
          icon={<Star size={18} />}
          color={data.averageRating >= 4.0 ? "green" : data.averageRating >= 3.0 ? "orange" : "red"}
        />
        <StatCard
          title="GPS 준수율"
          value={`${data.gpsComplianceRate}%`}
          subValue="체크인/아웃 GPS 기록"
          icon={<MapPin size={18} />}
          color={data.gpsComplianceRate >= 80 ? "green" : "orange"}
        />
        <StatCard
          title="소속 인력"
          value={data.staffCount}
          unit="명"
          subValue={`전체 세션 ${data.totalSessions}건`}
          icon={<Users size={18} />}
          color="blue"
        />
      </div>

      {/* 상세 현황 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">품질 지표 상세</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">지표</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">수치</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">일지 제출율</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">{data.journalSubmissionRate}%</td>
                <td className="px-5 py-3 text-center">
                  <QualityBadge value={data.journalSubmissionRate} thresholds={[80, 60]} />
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">평균 이용자 평점</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">{data.averageRating.toFixed(1)}</td>
                <td className="px-5 py-3 text-center">
                  <QualityBadge value={data.averageRating * 20} thresholds={[80, 60]} />
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">GPS 준수율</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">{data.gpsComplianceRate}%</td>
                <td className="px-5 py-3 text-center">
                  <QualityBadge value={data.gpsComplianceRate} thresholds={[80, 60]} />
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-700 font-medium">완료 세션 수</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">{data.completedSessions}건</td>
                <td className="px-5 py-3 text-center">
                  <span className="text-xs text-gray-400">전체 {data.totalSessions}건</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QualityBadge({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  if (value >= thresholds[0]) {
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">양호</span>;
  }
  if (value >= thresholds[1]) {
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">주의</span>;
  }
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">개선필요</span>;
}
