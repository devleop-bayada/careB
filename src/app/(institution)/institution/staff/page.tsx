"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, User } from "lucide-react";

interface StaffItem {
  id: string;
  status: string;
  joinedAt: string;
  recipientCount: number;
  caregiver: {
    id: string;
    name: string;
    phone: string;
    caregiverProfile?: {
      licenseNumber: string | null;
      licenseVerified: boolean;
      averageRating: number;
      totalCares: number;
      grade: string;
    } | null;
  };
}

const GRADE_LABEL: Record<string, string> = {
  NEWBIE: "신입",
  GENERAL: "일반",
  SKILLED: "숙련",
  EXPERT: "전문",
  MASTER: "마스터",
};

export default function InstitutionStaffPage() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/institution/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
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
          <h1 className="text-xl font-black text-gray-900">인력관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">소속 요양보호사 {staff.length}명</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStaff}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/institution/staff/register"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            <Plus size={14} />
            요양보호사 등록
          </Link>
        </div>
      </div>

      {/* 목록 */}
      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <User size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">등록된 요양보호사가 없습니다.</p>
          <Link
            href="/institution/staff/register"
            className="inline-block mt-4 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            첫 요양보호사 등록하기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">이름</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">연락처</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">자격</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">등급</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">평점</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">담당 이용자</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.caregiver.name}</td>
                    <td className="px-5 py-3 text-gray-600">{s.caregiver.phone}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {s.caregiver.caregiverProfile?.licenseVerified ? (
                        <span className="text-green-600 text-xs font-medium">인증완료</span>
                      ) : (
                        <span className="text-gray-400 text-xs">미인증</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {GRADE_LABEL[s.caregiver.caregiverProfile?.grade ?? "NEWBIE"] ?? "신입"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-900">
                      {s.caregiver.caregiverProfile?.averageRating?.toFixed(1) ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-900">{s.recipientCount}명</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.status === "ACTIVE" ? "활동중" : "비활성"}
                      </span>
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
