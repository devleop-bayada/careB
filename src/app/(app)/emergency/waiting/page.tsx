"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/layout/BackHeader";
import Button from "@/components/ui/Button";
import { CheckCircle, Clock, XCircle, Users } from "lucide-react";

const TIMEOUT_SECONDS = 30 * 60; // 30분

export default function EmergencyWaitingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emergencyCareId = searchParams.get("id") ?? "";
  const sentCount = parseInt(searchParams.get("count") ?? "0", 10);

  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const [accepted, setAccepted] = useState(false);
  const [acceptedCaregiverId, setAcceptedCaregiverId] = useState<string | null>(null);
  const [acceptedMatchId, setAcceptedMatchId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // 수락 여부 폴링
  const pollStatus = useCallback(async () => {
    if (!emergencyCareId) return;
    try {
      const res = await fetch("/api/emergency-care");
      if (!res.ok) return;
      const data = await res.json();
      const care = (data.emergencyCares ?? []).find(
        (c: { id: string; matches?: { status: string; caregiverId: string }[] }) => c.id === emergencyCareId
      );
      if (!care) return;
      const acceptedMatch = (care.matches ?? []).find(
        (m: { status: string; caregiverId: string }) => m.status === "ACCEPTED"
      );
      if (acceptedMatch) {
        setAccepted(true);
        setAcceptedCaregiverId(acceptedMatch.caregiverId);
        setAcceptedMatchId(acceptedMatch.id ?? null);
      }
    } catch {}
  }, [emergencyCareId]);

  useEffect(() => {
    const pollInterval = setInterval(pollStatus, 15000);
    return () => clearInterval(pollInterval);
  }, [pollStatus]);

  useEffect(() => {
    if (accepted || timedOut) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimedOut(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [accepted, timedOut]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  // 수락됨
  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackHeader title="긴급 돌봄 매칭" fallbackHref="/home" />
        <div className="flex flex-col items-center justify-center p-8 mt-16 space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">매칭 성공!</h2>
          <p className="text-sm text-gray-600">요양보호사가 긴급 돌봄 요청을 수락했습니다.</p>
          <Button
            onClick={() =>
              acceptedMatchId
                ? router.push(`/matching/${acceptedMatchId}`)
                : router.push("/matching")
            }
            className="w-full max-w-xs"
          >
            매칭 상세 보기
          </Button>
        </div>
      </div>
    );
  }

  // 타임아웃
  if (timedOut) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackHeader title="긴급 돌봄 매칭" fallbackHref="/home" />
        <div className="flex flex-col items-center justify-center p-8 mt-16 space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">매칭 실패</h2>
          <p className="text-sm text-gray-600">
            30분 내에 응답한 요양보호사가 없습니다.
            <br />
            다시 시도하거나 고객센터에 문의해주세요.
          </p>
          <Button onClick={() => router.push("/emergency")} className="w-full max-w-xs">
            다시 시도
          </Button>
          <button
            onClick={() => router.push("/home")}
            className="text-sm text-gray-500 underline"
          >
            고객센터 문의
          </button>
        </div>
      </div>
    );
  }

  // 대기 중
  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="긴급 돌봄 요청" fallbackHref="/home" />
      <div className="flex flex-col items-center justify-center p-8 mt-8 space-y-8 text-center">
        {/* 로딩 애니메이션 */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock size={28} className="text-blue-500" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            요양보호사를 찾고 있습니다...
          </h2>
          <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>

        {/* 발송 현황 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm w-full max-w-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Users size={18} />
              <span className="text-sm font-medium">요청 발송</span>
            </div>
            <span className="text-base font-bold text-blue-600">{sentCount}명</span>
          </div>
        </div>

        {/* 타이머 */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 w-full max-w-xs">
          <p className="text-xs text-orange-600 mb-1">남은 시간</p>
          <p className="text-3xl font-bold text-orange-500 tabular-nums">
            {formatTime(secondsLeft)}
          </p>
          <p className="text-xs text-orange-400 mt-1">30분 내 응답 없으면 자동 만료</p>
        </div>

        <p className="text-xs text-gray-400 px-4">
          요양보호사가 수락하면 자동으로 알림이 표시됩니다.
        </p>
      </div>
    </div>
  );
}
