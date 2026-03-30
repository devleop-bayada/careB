"use client";

import { useState } from "react";
import { Users, Phone, UserPlus, Check, X, Shield } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CoGuardian {
  id: string;
  name: string;
  phone: string;
  permission: "READ" | "READ_WRITE";
  status: "PENDING" | "ACCEPTED";
}

export default function CoGuardiansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coGuardians, setCoGuardians] = useState<CoGuardian[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [invitePermission, setInvitePermission] = useState<"READ" | "READ_WRITE">("READ");
  const [loading, setLoading] = useState(false);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  const user = session?.user as any;
  if (user?.role !== "GUARDIAN") { router.push("/home"); return null; }

  function formatPhone(value: string) {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!invitePhone.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/co-guardians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: invitePhone, permission: invitePermission }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoGuardians((prev) => [
          ...prev,
          {
            id: data.id || Date.now().toString(),
            name: data.name || invitePhone,
            phone: invitePhone,
            permission: invitePermission,
            status: "PENDING",
          },
        ]);
        setInvitePhone("");
        setShowInviteForm(false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function removeCoGuardian(id: string) {
    await fetch(`/api/co-guardians/${id}`, { method: "DELETE" });
    setCoGuardians((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="공동보호자 관리" fallbackHref="/my" />

      {/* Invite Form */}
      {showInviteForm && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">공동보호자 초대</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">전화번호</label>
              <input
                type="tel"
                value={invitePhone}
                onChange={(e) => setInvitePhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">권한 수준</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInvitePermission("READ")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                    invitePermission === "READ"
                      ? "border-primary-400 bg-primary-50 text-primary-600"
                      : "border-gray-100 text-gray-600"
                  }`}
                >
                  읽기
                </button>
                <button
                  type="button"
                  onClick={() => setInvitePermission("READ_WRITE")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                    invitePermission === "READ_WRITE"
                      ? "border-primary-400 bg-primary-50 text-primary-600"
                      : "border-gray-100 text-gray-600"
                  }`}
                >
                  읽기+쓰기
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!invitePhone.trim() || loading}
              className="w-full bg-primary-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? "초대 중..." : "초대장 보내기"}
            </button>
          </form>
        </div>
      )}

      {/* Co-Guardian List */}
      <div className="px-4 mt-4 space-y-2 pb-16">
        {coGuardians.length === 0 && !showInviteForm ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">공동보호자가 없어요</p>
            <p className="text-sm text-gray-400 mt-1">가족을 초대하여 함께 돌봄을 관리하세요</p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              공동보호자 초대하기
            </button>
          </div>
        ) : (
          coGuardians.map((cg) => (
            <div key={cg.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-500">{cg.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{cg.name}</p>
                    <p className="text-xs text-gray-500">{cg.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    cg.status === "ACCEPTED"
                      ? "bg-green-50 text-green-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}>
                    {cg.status === "ACCEPTED" ? "수락됨" : "대기 중"}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    cg.permission === "READ_WRITE"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {cg.permission === "READ_WRITE" ? "읽기+쓰기" : "읽기"}
                  </span>
                  <button
                    onClick={() => removeCoGuardian(cg.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
