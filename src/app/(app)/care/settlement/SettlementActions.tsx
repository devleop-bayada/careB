"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function SettlementActions({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"idle" | "confirmed" | "disputing" | "disputed">("idle");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await fetch(`/api/care-sessions/${sessionId}/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      setStatus("confirmed");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDispute() {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/care-sessions/${sessionId}/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispute", reason }),
      });
      setStatus("disputed");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (status === "confirmed") {
    return (
      <div className="flex items-center gap-1.5 mt-2 text-green-600">
        <CheckCircle size={14} />
        <span className="text-xs font-semibold">정산 확인 완료</span>
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <div className="flex items-center gap-1.5 mt-2 text-red-500">
        <AlertTriangle size={14} />
        <span className="text-xs font-semibold">이의 제기 접수됨</span>
      </div>
    );
  }

  if (status === "disputing") {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="이의 사유를 입력해주세요..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("idle")}
            className="flex-1 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg"
          >
            취소
          </button>
          <button
            onClick={handleDispute}
            disabled={!reason.trim() || loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-500 rounded-lg disabled:opacity-60"
          >
            {loading ? "처리 중..." : "이의 제기"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-60"
      >
        <CheckCircle size={12} />
        정산 확인
      </button>
      <button
        onClick={() => setStatus("disputing")}
        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
      >
        <AlertTriangle size={12} />
        이의 제기
      </button>
    </div>
  );
}
