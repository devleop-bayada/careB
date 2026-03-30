"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, CreditCard } from "lucide-react";

interface ClaimItem {
  id: string;
  yearMonth: string;
  totalAmount: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "작성중",
  SUBMITTED: "제출완료",
  REVIEWING: "심사중",
  APPROVED: "승인",
  REJECTED: "반려",
  PAID: "지급완료",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  REVIEWING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
  PAID: "bg-teal-50 text-teal-700",
};

export default function InstitutionClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchClaims() {
    setLoading(true);
    try {
      const res = await fetch("/api/institution/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaims();
  }, []);

  if (loading) {
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
          <h1 className="text-xl font-black text-gray-900">급여청구</h1>
          <p className="text-sm text-gray-400 mt-0.5">월별 급여 청구 관리</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchClaims}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/institution/claims/create"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            <Plus size={14} />
            청구서 생성
          </Link>
        </div>
      </div>

      {/* 목록 */}
      {claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">생성된 청구서가 없습니다.</p>
          <Link
            href="/institution/claims/create"
            className="inline-block mt-4 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            첫 청구서 생성하기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">청구 연월</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">청구 금액</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">제출일</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">생성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.yearMonth}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                      {c.totalAmount.toLocaleString()}원
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLOR[c.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString("ko-KR") : "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
