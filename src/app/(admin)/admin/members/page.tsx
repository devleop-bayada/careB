"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Ban, UserX } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  matchCount: number;
  _count: { payments: number };
}

const ROLE_LABEL: Record<string, string> = {
  GUARDIAN: "보호자",
  CAREGIVER: "요양보호사",
  ADMIN: "관리자",
  INSTITUTION: "기관",
};

const TABS = [
  { key: "", label: "전체" },
  { key: "GUARDIAN", label: "보호자" },
  { key: "CAREGIVER", label: "요양보호사" },
  { key: "INSTITUTION", label: "기관" },
];

function getStatusBadge(m: Member) {
  if (m.isBanned) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-600">정지</span>;
  if (!m.isActive) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">해지</span>;
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-600">활성</span>;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleTab, setRoleTab] = useState("");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchMembers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (roleTab) params.set("role", roleTab);
      if (query) params.set("q", query);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/members?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMembers(data.members);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMembers(); }, [page, roleTab, query, statusFilter]);

  async function handleAction(id: string, action: string) {
    const msg = action === "ban" ? "정말 정지하시겠습니까?" : action === "deactivate" ? "정말 해지하시겠습니까?" : "활성화하시겠습니까?";
    if (!confirm(msg)) return;
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchMembers();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-black text-gray-900">회원 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">전체 {total.toLocaleString()}명</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setRoleTab(tab.key); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              roleTab === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">
            검색
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
          >
            <option value="">상태 전체</option>
            <option value="active">활성</option>
            <option value="banned">정지</option>
            <option value="inactive">해지</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">이름</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">이메일</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">역할</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">가입일</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">매칭</th>
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
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-5 py-3 text-gray-500">{m.email ?? "-"}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(m)}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{m.matchCount}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/members/${m.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500"
                          title="상세 보기"
                        >
                          <Eye size={15} />
                        </button>
                        {!m.isBanned && m.isActive && (
                          <button
                            onClick={() => handleAction(m.id, "ban")}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            title="정지"
                          >
                            <Ban size={15} />
                          </button>
                        )}
                        {m.isActive && !m.isBanned && (
                          <button
                            onClick={() => handleAction(m.id, "deactivate")}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            title="해지"
                          >
                            <UserX size={15} />
                          </button>
                        )}
                        {(m.isBanned || !m.isActive) && (
                          <button
                            onClick={() => handleAction(m.id, "activate")}
                            className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            활성화
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{total}명 중 {(page - 1) * 20 + 1}~{Math.min(page * 20, total)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
