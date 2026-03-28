import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import MatchingTabs from "./MatchingTabs";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기 중", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "수락됨", color: "bg-blue-100 text-blue-700" },
  REJECTED: { label: "거절됨", color: "bg-red-100 text-red-500" },
  CONFIRMED: { label: "확정됨", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "진행 중", color: "bg-primary-100 text-primary-700" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "취소됨", color: "bg-gray-100 text-gray-400" },
};

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  HOME_CARE: "방문요양",
  HOME_BATH: "방문목욕",
  HOME_NURSING: "방문간호",
  DAY_NIGHT_CARE: "주야간보호",
  SHORT_TERM_CARE: "단기보호",
  HOURLY_CARE: "시간제돌봄",
  HOSPITAL_CARE: "병원간병",
  DEMENTIA_CARE: "치매전문",
  HOSPICE_CARE: "임종돌봄",
};

async function getMatches(userId: string, role: string, tab: string) {
  if (role === "GUARDIAN") {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return [];

    const where: any = { guardianId: guardianProfile.id };
    if (tab === "PENDING") where.status = "PENDING";
    else if (tab === "ACTIVE") where.status = { in: ["ACCEPTED", "CONFIRMED", "IN_PROGRESS"] };
    else if (tab === "DONE") where.status = { in: ["COMPLETED", "REJECTED", "CANCELLED"] };

    return prisma.match.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      take: 20,
      include: {
        caregiver: { include: { user: { select: { name: true, profileImage: true } } } },
      },
    });
  } else {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return [];

    const where: any = { caregiverId: caregiverProfile.id };
    if (tab === "PENDING") where.status = "PENDING";
    else if (tab === "ACTIVE") where.status = { in: ["ACCEPTED", "CONFIRMED", "IN_PROGRESS"] };
    else if (tab === "DONE") where.status = { in: ["COMPLETED", "REJECTED", "CANCELLED"] };

    return prisma.match.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      take: 20,
      include: {
        guardian: { include: { user: { select: { name: true, profileImage: true } } } },
      },
    });
  }
}

export default async function MatchingPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const tab = searchParams.tab || "ALL";
  const isGuardian = user.role === "GUARDIAN";

  const matches = await getMatches(user.id, user.role, tab);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-4 pb-0 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">매칭 현황</h1>
        <MatchingTabs activeTab={tab} />
      </div>

      <div className="px-4 py-4 space-y-3">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">아직 매칭 내역이 없습니다</p>
            <p className="text-sm text-gray-400 mt-1 text-center leading-relaxed">
              {isGuardian
                ? "요양보호사를 검색하고 상담을 요청해 보세요"
                : "일자리를 검색하고 지원해 보세요"}
            </p>
            <Link
              href={isGuardian ? "/search/caregiver" : "/search/guardian"}
              className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              {isGuardian ? "요양보호사 찾기" : "일자리 찾기"}
            </Link>
          </div>
        ) : (
          matches.map((match: any) => {
            const other = isGuardian ? match.caregiver?.user : match.guardian?.user;
            const status = STATUS_MAP[match.status] || { label: match.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Link key={match.id} href={`/matching/${match.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {other?.profileImage ? (
                          <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">{other?.name?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{other?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {SERVICE_CATEGORY_LABELS[match.serviceCategory] || match.serviceCategory}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(match.requestedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
