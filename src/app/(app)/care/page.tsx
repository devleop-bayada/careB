import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import CareTabs from "./CareTabs";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "예정", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "진행 중", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-500" },
};

async function getCareSessions(userId: string, role: string, tab: string) {
  const statusFilter = tab !== "ALL" ? { status: tab } : {};

  if (role === "CAREGIVER") {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return [];
    return prisma.careSession.findMany({
      where: { caregiverId: caregiverProfile.id, ...statusFilter },
      orderBy: { scheduledDate: tab === "COMPLETED" ? "desc" : "asc" },
      take: 20,
      include: {
        caregiver: { include: { user: { select: { name: true, profileImage: true } } } },
        match: { include: { guardian: { include: { user: { select: { name: true, profileImage: true } } } } } },
        journals: { select: { id: true } },
      },
    });
  } else {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return [];
    return prisma.careSession.findMany({
      where: { match: { guardianId: guardianProfile.id }, ...statusFilter },
      orderBy: { scheduledDate: tab === "COMPLETED" ? "desc" : "asc" },
      take: 20,
      include: {
        caregiver: { include: { user: { select: { name: true, profileImage: true } } } },
        match: true,
        journals: { select: { id: true } },
      },
    });
  }
}

export default async function CarePage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const isCaregiver = user.role === "CAREGIVER";
  const tab = searchParams.tab || "SCHEDULED";

  const sessions = await getCareSessions(user.id, user.role, tab);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-4 pb-0 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">돌봄 관리</h1>
        <CareTabs activeTab={tab} />
      </div>

      <div className="px-4 py-4 space-y-3">
        {sessions.length === 0 ? (
          <EmptyState
            icon={<Calendar size={40} />}
            title={
              tab === "SCHEDULED" ? "예정된 돌봄이 없습니다" :
              tab === "IN_PROGRESS" ? "진행 중인 돌봄이 없습니다" :
              tab === "COMPLETED" ? "완료된 돌봄이 없습니다" : "진행 중인 돌봄이 없습니다"
            }
            description="요양보호사와 매칭 후 돌봄 서비스가 시작됩니다"
          />
        ) : (
          sessions.map((cs: any) => {
            const otherName = isCaregiver
              ? cs.match?.guardian?.user?.name
              : cs.caregiver?.user?.name;
            const otherImage = isCaregiver
              ? cs.match?.guardian?.user?.profileImage
              : cs.caregiver?.user?.profileImage;
            const status = STATUS_MAP[cs.status] || { label: cs.status, color: "bg-gray-100 text-gray-600" };
            const hasJournal = cs.journals?.length > 0;

            return (
              <Link key={cs.id} href={`/care/${cs.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={otherImage} name={otherName} size="md" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{otherName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(cs.scheduledDate).toLocaleDateString("ko-KR", {
                            month: "long", day: "numeric",
                          })} {cs.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={status.color} size="sm">
                        {status.label}
                      </Badge>
                      {isCaregiver && cs.status === "COMPLETED" && (
                        <Badge variant={hasJournal ? "success" : "primary"} size="sm">
                          {hasJournal ? "일지 작성됨" : "일지 미작성"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-500">
                      {cs.totalHours ? `${cs.totalHours}시간` : cs.startTime + " ~ " + cs.endTime}
                      {cs.totalAmount ? ` · ${cs.totalAmount.toLocaleString()}원` : ""}
                    </p>
                    <ChevronRight size={14} className="text-gray-300" />
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
