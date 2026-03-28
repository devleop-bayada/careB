import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, FileText, Users, ChevronLeft } from "lucide-react";
import MatchingActions from "./MatchingActions";
import BackHeader from "@/components/layout/BackHeader";

const STATUS_MAP: Record<string, { label: string; color: string; desc: string }> = {
  PENDING: { label: "대기 중", color: "bg-yellow-100 text-yellow-700", desc: "요양보호사의 수락을 기다리고 있어요" },
  ACCEPTED: { label: "수락됨", color: "bg-blue-100 text-blue-700", desc: "요양보호사가 제안을 수락했어요" },
  REJECTED: { label: "거절됨", color: "bg-red-100 text-red-500", desc: "요양보호사가 제안을 거절했어요" },
  CONFIRMED: { label: "확정됨", color: "bg-green-100 text-green-700", desc: "매칭이 확정되었어요" },
  IN_PROGRESS: { label: "진행 중", color: "bg-primary-100 text-primary-700", desc: "요양이 진행 중이에요" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-600", desc: "요양이 완료되었어요" },
  CANCELLED: { label: "취소됨", color: "bg-gray-100 text-gray-400", desc: "매칭이 취소되었어요" },
};

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  HOME_CARE: "방문요양",
  BATH_CARE: "방문목욕",
  NURSING: "방문간호",
  COGNITIVE: "인지활동",
  HOUSEKEEPING: "가사지원",
};

const TIMELINE_STEPS = ["PENDING", "ACCEPTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

async function getMatch(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
    },
  });
}

export default async function MatchingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const match = await getMatch(params.id);
  if (!match) notFound();

  // Determine if current user is parent or sitter via profile lookup
  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId: user.id } });
  const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });

  const isGuardian = guardianProfile?.id === match.guardianId;
  const isCaregiver = caregiverProfile?.id === match.caregiverId;
  const other = isGuardian ? match.caregiver?.user : match.guardian?.user;
  const statusInfo = STATUS_MAP[match.status] || { label: match.status, color: "bg-gray-100 text-gray-600", desc: "" };
  const currentStepIndex = TIMELINE_STEPS.indexOf(match.status);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <BackHeader title="매칭 상세" fallbackHref="/matching" />

      {/* Status Header */}
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-bold text-gray-900">매칭 정보</h1>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">{statusInfo.desc}</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Other Party */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-3">{isGuardian ? "요양보호사" : "보호자"}</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {other?.profileImage ? (
                <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-gray-500">{other?.name?.[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{other?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {SERVICE_CATEGORY_LABELS[match.serviceCategory] || match.serviceCategory}
              </p>
            </div>
            <Link
              href={`/chat/${match.id}`}
              className="flex items-center gap-1.5 bg-primary-50 text-primary-500 text-xs font-semibold px-3 py-2 rounded-full"
            >
              <MessageSquare size={13} />
              채팅
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-4">진행 현황</h2>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, i) => {
                const isDone = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const stepInfo = STATUS_MAP[step];
                return (
                  <div key={step} className="flex items-start gap-4 relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                      isDone ? "bg-primary-500 border-primary-500" : "bg-white border-gray-200"
                    }`}>
                      {isDone && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className={`text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                        {stepInfo?.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary-500 mt-0.5">{stepInfo?.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">매칭 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">서비스 유형</span>
              <span className="text-xs font-semibold text-gray-900">
                {SERVICE_CATEGORY_LABELS[match.serviceCategory] || match.serviceCategory}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">요청일</span>
              <span className="text-xs font-semibold text-gray-900">
                {new Date(match.requestedAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">시작일</span>
              <span className="text-xs font-semibold text-gray-900">
                {new Date(match.startDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {match.specialRequests && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-500 mb-1">특별 요청사항</p>
                <p className="text-sm text-gray-700">{match.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Care Recipients */}
        {(match as any).careRecipients && (match as any).careRecipients.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={15} className="text-primary-500" />
              연결된 어르신
            </h2>
            <div className="space-y-2">
              {(match as any).careRecipients.map((cr: any) => (
                <div key={cr.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-sm">{cr.gender === "FEMALE" ? "👵" : "👴"}</span>
                  <span className="text-sm text-gray-700 font-medium">{cr.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract Button */}
        {["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(match.status) && (
          <Link
            href={`/matching/${params.id}/contract`}
            className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">계약서</p>
                  <p className="text-xs text-gray-500">계약서 확인 및 서명</p>
                </div>
              </div>
              <ChevronLeft size={16} className="text-gray-300 rotate-180" />
            </div>
          </Link>
        )}
      </div>

      {/* Actions */}
      <MatchingActions
        matchId={match.id}
        status={match.status}
        isGuardian={isGuardian}
        isCaregiver={isCaregiver}
      />
    </div>
  );
}
