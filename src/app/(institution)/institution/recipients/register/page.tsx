"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StaffOption {
  id: string;
  caregiver: { name: string };
}

export default function RecipientRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    careLevel: "",
    careType: "",
    assignedStaffId: "",
  });
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch("/api/institution/staff");
        if (res.ok) {
          const data = await res.json();
          setStaffList(data.staff ?? []);
        }
      } catch {}
    }
    fetchStaff();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.birthDate || !form.careType) {
      setError("이름, 생년월일, 서비스 유형은 필수입니다.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/institution/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "등록에 실패했습니다.");
        return;
      }

      setSuccess("이용자가 등록되었습니다.");
      setTimeout(() => router.push("/institution/recipients"), 1500);
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
          href="/institution/recipients"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">이용자 등록</h1>
          <p className="text-sm text-gray-400 mt-0.5">돌봄 서비스를 이용할 어르신 정보를 등록합니다</p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이름 *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="어르신 성함"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">생년월일 *</label>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">장기요양등급</label>
          <select
            name="careLevel"
            value={form.careLevel}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">선택 안함</option>
            <option value="1등급">1등급</option>
            <option value="2등급">2등급</option>
            <option value="3등급">3등급</option>
            <option value="4등급">4등급</option>
            <option value="5등급">5등급</option>
            <option value="인지지원등급">인지지원등급</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">서비스 유형 *</label>
          <select
            name="careType"
            value={form.careType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">선택해주세요</option>
            <option value="방문요양">방문요양</option>
            <option value="방문목욕">방문목욕</option>
            <option value="방문간호">방문간호</option>
            <option value="주야간보호">주야간보호</option>
            <option value="단기보호">단기보호</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">담당 요양보호사</label>
          <select
            name="assignedStaffId"
            value={form.assignedStaffId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">미배정</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.caregiver.name}
              </option>
            ))}
          </select>
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
