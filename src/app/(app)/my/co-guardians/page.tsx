"use client";

import { useState } from "react";
import { Users, Mail, UserPlus, Check, X, Shield } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

interface CoGuardian {
  id: string;
  name: string;
  email: string;
  permission: "READ" | "READ_WRITE";
  status: "PENDING" | "ACCEPTED";
}

export default function CoGuardiansPage() {
  const [coGuardians, setCoGuardians] = useState<CoGuardian[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"READ" | "READ_WRITE">("READ");
  const [loading, setLoading] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/co-guardians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, permission: invitePermission }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoGuardians((prev) => [
          ...prev,
          {
            id: data.id || Date.now().toString(),
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            permission: invitePermission,
            status: "PENDING",
          },
        ]);
        setInviteEmail("");
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
              <label className="text-xs font-semibold text-gray-700 mb-1 block">이메일</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="family@example.com"
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
              disabled={!inviteEmail.trim() || loading}
              className="w-full bg-primary-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? "초대 중..." : "초대장 보내기"}
            </button>
          </form>
        </div>
      )}

      {/* Co-Guardian List */}
      <div className="px-4 mt-4 space-y-2 pb-8">
        {coGuardians.length === 0 && !showInviteForm ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">공동보호자가 없어요</p>
            <p className="text-sm text-gray-400 mt-1">가족을 초대하여 함께 돌봄을 관리하세요</p>
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
                    <p className="text-xs text-gray-500">{cg.email}</p>
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
