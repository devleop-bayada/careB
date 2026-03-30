"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClaimCreatePage() {
  const router = useRouter();
  const now = new Date();
  const defaultYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [yearMonth, setYearMonth] = useState(defaultYearMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ totalAmount: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!yearMonth) {
      setError("청구 연월을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/institution/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearMonth }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "청구서 생성에 실패했습니다.");
        return;
      }

      setResult({ totalAmount: data.claim.totalAmount });
      setTimeout(() => router.push("/institution/claims"), 2000);
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
          href="/institution/claims"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">청구서 생성</h1>
          <p className="text-sm text-gray-400 mt-0.5">돌봄 기록 기반으로 자동 계산됩니다</p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">청구 연월</label>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            해당 월의 완료된 돌봄 세션 금액을 자동으로 합산합니다.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}
        {result && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-700 text-sm font-semibold mb-1">청구서가 생성되었습니다.</p>
            <p className="text-green-600 text-sm">
              자동 계산 금액: <strong>{result.totalAmount.toLocaleString()}원</strong>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "생성 중..." : "청구서 생성"}
        </button>
      </form>
    </div>
  );
}
