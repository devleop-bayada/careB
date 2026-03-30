"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StaffRegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("요양보호사 연락처를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/institution/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caregiverPhone: phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "등록에 실패했습니다.");
        return;
      }

      setSuccess(`${data.staff.caregiver.name}님이 등록되었습니다.`);
      setTimeout(() => router.push("/institution/staff"), 1500);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/institution/staff"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">요양보호사 등록</h1>
          <p className="text-sm text-gray-400 mt-0.5">CareB에 가입된 요양보호사를 기관에 등록합니다</p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1.5">CareB에 요양보호사로 가입된 회원의 연락처를 입력해주세요.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
