import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, BookOpen, ChevronRight, MapPin } from "lucide-react";
import CareCheckInOut from "./CareCheckInOut";
import SOSButton from "./SOSButton";
import BackHeader from "@/components/layout/BackHeader";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "예정", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "진행 중", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-500" },
};

async function getCareSession(id: string) {
  return prisma.careSession.findUnique({
    where: { id },
    include: {
      caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      match: {
        include: {
          guardian: {
            include: {
              user: { select: { id: true, name: true, profileImage: true } },
              careRecipients: true,
            },
          },
        },
      },
      recipients: { include: { careRecipient: true } },
      journals: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function CareSessionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const isCaregiver = user.role === "CAREGIVER";

  const careSession = await getCareSession(params.id);
  if (!careSession) notFound();

  const status = STATUS_MAP[careSession.status] || { label: careSession.status, color: "bg-gray-100 text-gray-600" };
  const sitterUser = careSession.caregiver?.user;
  const parentUser = careSession.match?.guardian?.user;
  const otherUser = isCaregiver ? parentUser : sitterUser;

  const caregiverProfile = careSession.caregiver;
  const canWriteJournal = isCaregiver && careSession.status === "COMPLETED";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <BackHeader title="돌봄 상세" fallbackHref="/care" />

      {/* Status Banner */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">
            {new Date(careSession.scheduledDate).toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric", weekday: "short",
            })}
          </h1>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${status.color}`}>{status.label}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Other party */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {otherUser?.profileImage ? (
                <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-gray-500">{otherUser?.name?.[0]}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">{isCaregiver ? "보호자" : "요양보호사"}</p>
              <p className="text-sm font-bold text-gray-900">{otherUser?.name}</p>
            </div>
            <Link
              href={`/chat/${careSession.matchId}`}
              className="ml-auto text-xs bg-primary-50 text-primary-500 font-semibold px-3 py-1.5 rounded-full"
            >
              메시지
            </Link>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">돌봄 일정</h2>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {new Date(careSession.scheduledDate).toLocaleDateString("ko-KR", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {careSession.startTime} ~ {careSession.endTime}
            </span>
          </div>
          {careSession.totalHours && (
            <p className="text-sm text-gray-700">
              총 {careSession.totalHours}시간 · {careSession.totalAmount?.toLocaleString()}원
            </p>
          )}
        </div>

        {/* Care Recipients */}
        {careSession.recipients && careSession.recipients.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">돌봄 어르신</h2>
            <div className="space-y-2">
              {careSession.recipients.map((cc: any) => {
                const recipient = cc.careRecipient;
                const birthYear = recipient?.birthYear ?? new Date().getFullYear();
                const age = new Date().getFullYear() - birthYear + 1;
                return (
                  <div key={cc.id} className="flex items-center gap-2">
                    <span>{recipient?.gender === "FEMALE" ? "👧" : "👦"}</span>
                    <span className="text-sm text-gray-700">{recipient?.name} · {age}세</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GPS Check-in/out */}
        {(careSession.status === "SCHEDULED" || careSession.status === "IN_PROGRESS") && (
          <CareCheckInOut sessionId={params.id} isCaregiver={isCaregiver} />
        )}

        {/* Journals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={15} className="text-primary-500" />
              돌봄 일지
            </h2>
            {canWriteJournal && (
              <Link
                href={`/care/${params.id}/journal`}
                className="text-xs bg-primary-500 text-white font-semibold px-3 py-1.5 rounded-full"
              >
                일지 작성
              </Link>
            )}
          </div>
          {careSession.journals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 일지가 없어요</p>
          ) : (
            <div className="space-y-2">
              {careSession.journals.map((journal: any) => (
                <div key={journal.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{journal.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{journal.content}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SOS Button */}
      {(careSession.status === "SCHEDULED" || careSession.status === "IN_PROGRESS") && (
        <SOSButton sessionId={params.id} />
      )}
    </div>
  );
}
