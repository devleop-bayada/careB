"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  matchId: string;
  status: string;
  isGuardian: boolean;
  isCaregiver: boolean;
}

const REJECTION_REASONS = [
  { value: "SCHEDULE_CONFLICT", label: "스케줄 불가" },
  { value: "TOO_FAR", label: "거리가 너무 멀어요" },
  { value: "SPECIALTY_MISMATCH", label: "전문분야가 맞지 않아요" },
  { value: "OTHER", label: "기타" },
];

export default function MatchingActions({ matchId, status, isGuardian, isCaregiver }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function updateStatus(newStatus: string, cancelReason?: string) {
    setLoading(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (cancelReason) body.cancelReason = cancelReason;
      await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setShowRejectModal(false);
    }
  }

  const showSitterActions = isCaregiver && status === "PENDING";
  const showParentCancel = isGuardian && ["PENDING", "ACCEPTED", "CONFIRMED"].includes(status);

  if (!showSitterActions && !showParentCancel) return null;

  return (
    <>
      {/* 거절 사유 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-black text-gray-900 mb-1">거절 사유 선택</h3>
            <p className="text-sm text-gray-500 mb-4">거절하시는 이유를 알려주세요</p>
            <div className="space-y-2 mb-5">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setRejectReason(reason.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    rejectReason === reason.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={() => updateStatus("REJECTED", rejectReason || undefined)}
                disabled={loading || !rejectReason}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
              >
                {loading ? "처리 중..." : "거절하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
        {showSitterActions && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 py-3.5 border-2 border-red-200 text-red-500 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              거절하기
            </button>
            <button
              onClick={() => updateStatus("ACCEPTED")}
              disabled={loading}
              className="flex-[2] py-3.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-60"
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
    </>
  );
}
