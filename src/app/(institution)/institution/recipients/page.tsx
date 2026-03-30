"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Search, UserPlus } from "lucide-react";

interface RecipientItem {
  id: string;
  name: string;
  birthDate: string;
  careLevel: string | null;
  careType: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  status: string;
  createdAt: string;
}

export default function InstitutionRecipientsPage() {
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchRecipients(q?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/institution/recipients?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecipients();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchRecipients(search);
  }

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
          <h1 className="text-xl font-black text-gray-900">이용자관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">이용자(어르신) {recipients.length}명</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchRecipients(search)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/institution/recipients/register"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            <Plus size={14} />
            이용자 등록
          </Link>
        </div>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
        >
          검색
        </button>
      </form>

      {/* 목록 */}
      {recipients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <UserPlus size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">등록된 이용자가 없습니다.</p>
          <Link
            href="/institution/recipients/register"
            className="inline-block mt-4 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            첫 이용자 등록하기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">이름</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">생년월일</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">요양등급</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">서비스 유형</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">담당자</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recipients.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-5 py-3 text-gray-600">{r.birthDate}</td>
                    <td className="px-5 py-3 text-gray-600">{r.careLevel ?? "-"}</td>
                    <td className="px-5 py-3 text-gray-600">{r.careType}</td>
                    <td className="px-5 py-3 text-gray-600">{r.assignedStaffName ?? "미배정"}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.status === "ACTIVE" ? "이용중" : "종료"}
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
