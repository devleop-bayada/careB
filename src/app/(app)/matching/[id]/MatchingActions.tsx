"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  matchId: string;
  status: string;
  isGuardian: boolean;
  isCaregiver: boolean;
}

export default function MatchingActions({ matchId, status, isGuardian, isCaregiver }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const showSitterActions = isCaregiver && status === "PENDING";
  const showParentCancel = isGuardian && ["PENDING", "ACCEPTED", "CONFIRMED"].includes(status);

  if (!showSitterActions && !showParentCancel) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-40">
      {showSitterActions && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            거절하기
          </button>
          <button
            onClick={() => updateStatus("ACCEPTED")}
            disabled={loading}
            className="flex-[2] py-3.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
          >
            {loading ? "처리 중..." : "수락하기"}
          </button>
        </div>
      )}
      {showParentCancel && (
        <button
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading}
          className="w-full py-3.5 border-2 border-red-200 text-red-500 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          {loading ? "처리 중..." : "매칭 취소하기"}
        </button>
      )}
    </div>
  );
}
