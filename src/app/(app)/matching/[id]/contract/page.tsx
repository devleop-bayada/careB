"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, CheckCircle, Clock, PenTool } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import BackHeader from "@/components/layout/BackHeader";

export default function ContractPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { data: session } = useSession();
  const isCaregiver = (session?.user as any)?.role === "CAREGIVER";

  const { data: matchData } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetch(`/api/matches/${matchId}`).then((r) => r.json()),
  });
  const match = matchData?.match;

  const [guardianSigned, setGuardianSigned] = useState(false);
  const [caregiverSigned, setCaregiverSigned] = useState(false);
  const [signing, setSigning] = useState(false);

  const bothSigned = guardianSigned && caregiverSigned;

  async function handleSign(party: "guardian" | "caregiver") {
    setSigning(true);
    try {
      await fetch(`/api/matches/${matchId}/contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party }),
      });
      if (party === "guardian") setGuardianSigned(true);
      else setCaregiverSigned(true);
    } catch {
      // ignore
    } finally {
      setSigning(false);
    }
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SERVICE_LABELS: Record<string, string> = {
    HOME_CARE: "방문요양", BATH_CARE: "방문목욕",
    NURSING: "방문간호", COGNITIVE: "인지활동", HOUSEKEEPING: "가사지원",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <BackHeader title="계약서" fallbackHref="/matching" />

      {/* Contract Status */}
      {bothSigned ? (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
          <p className="text-lg font-black text-green-800">계약 체결 완료</p>
          <p className="text-sm text-green-600 mt-1">양측 모두 서명을 완료했습니다</p>
        </div>
      ) : (
        <div className="mx-4 mt-4 bg-primary-50 border border-primary-200 rounded-2xl p-5 text-center">
          <FileText size={40} className="text-primary-500 mx-auto mb-2" />
          <p className="text-lg font-black text-primary-800">계약서 서명 대기</p>
          <p className="text-sm text-primary-600 mt-1">양측 모두 서명하면 계약이 체결됩니다</p>
        </div>
      )}

      {/* Contract Details */}
      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={15} className="text-primary-500" />
            계약 정보
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">서비스 유형</span>
              <span className="text-xs font-semibold text-gray-900">
                {SERVICE_LABELS[match.serviceCategory] || match.serviceCategory}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">보호자</span>
              <span className="text-xs font-semibold text-gray-900">{match.guardian?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">요양보호사</span>
              <span className="text-xs font-semibold text-gray-900">{match.caregiver?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">시작일</span>
              <span className="text-xs font-semibold text-gray-900">
                {new Date(match.startDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {match.specialRequests && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-500 mb-1">특별 요청사항</p>
                <p className="text-sm text-gray-700">{match.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Signing Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">서명 현황</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">보호자</span>
                <span className="text-xs text-gray-500">{match.guardian?.user?.name}</span>
              </div>
              {guardianSigned ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-semibold">서명 완료</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={16} />
                  <span className="text-xs font-semibold">대기 중</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">요양보호사</span>
                <span className="text-xs text-gray-500">{match.caregiver?.user?.name}</span>
              </div>
              {caregiverSigned ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-semibold">서명 완료</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={16} />
                  <span className="text-xs font-semibold">대기 중</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Buttons */}
      {!bothSigned && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
          <div className="flex gap-2">
            {!isCaregiver && (
              <button
                onClick={() => handleSign("guardian")}
                disabled={signing || guardianSigned}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  guardianSigned
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60"
                }`}
              >
                <PenTool size={15} />
                {guardianSigned ? "서명 완료" : "서명하기"}
              </button>
            )}
            {isCaregiver && (
              <button
                onClick={() => handleSign("caregiver")}
                disabled={signing || caregiverSigned}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  caregiverSigned
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                }`}
              >
                <PenTool size={15} />
                {caregiverSigned ? "서명 완료" : "서명하기"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
