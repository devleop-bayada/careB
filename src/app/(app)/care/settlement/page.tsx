import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DollarSign, CheckCircle, Clock, AlertTriangle, CreditCard } from "lucide-react";
import SettlementActions from "./SettlementActions";
import BackHeader from "@/components/layout/BackHeader";

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: "정산 대기", color: "bg-yellow-100 text-yellow-700", icon: "clock" },
  CONFIRMED: { label: "정산 확인", color: "bg-blue-100 text-blue-700", icon: "check" },
  DISPUTED: { label: "이의 제기", color: "bg-red-100 text-red-600", icon: "alert" },
  PAID: { label: "지급 완료", color: "bg-green-100 text-green-700", icon: "paid" },
};

const PLATFORM_FEE_RATE = 0.03;

async function getSettlements(userId: string, role: string) {
  if (role === "CAREGIVER") {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return [];
    return prisma.careSession.findMany({
      where: { caregiverId: caregiverProfile.id, status: "COMPLETED" },
      orderBy: { scheduledDate: "desc" },
      include: {
        match: { include: { guardian: { include: { user: { select: { name: true } } } } } },
      },
    });
  } else {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return [];
    return prisma.careSession.findMany({
      where: { match: { guardianId: guardianProfile.id }, status: "COMPLETED" },
      orderBy: { scheduledDate: "desc" },
      include: {
        caregiver: { include: { user: { select: { name: true } } } },
        match: true,
      },
    });
  }
}

function groupByMonth(sessions: any[]) {
  const groups: Record<string, any[]> = {};
  for (const s of sessions) {
    const key = new Date(s.scheduledDate).toLocaleDateString("ko-KR", {
      year: "numeric", month: "long",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}

export default async function SettlementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const isCaregiver = user.role === "CAREGIVER";
  const isGuardian = user.role === "GUARDIAN";

  const sessions = await getSettlements(user.id, user.role);
  const grouped = groupByMonth(sessions);
  const totalAmount = sessions.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE);
  const netAmount = totalAmount - platformFee;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="정산 내역" fallbackHref="/my" />

      {/* Total */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-5 text-white">
        <p className="text-sm text-primary-100">{isCaregiver ? "총 수입" : "총 지출"}</p>
        <p className="text-3xl font-black mt-1">{totalAmount.toLocaleString()}원</p>
        <p className="text-primary-100 text-xs mt-1">{sessions.length}건의 요양 완료</p>
      </div>

      {/* Fee Breakdown */}
      {totalAmount > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={15} className="text-primary-500" />
            정산 상세
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">총 요양비</span>
              <span className="text-xs font-semibold text-gray-900">{totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">플랫폼 수수료 (3%)</span>
              <span className="text-xs font-semibold text-red-500">-{platformFee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">실수령액</span>
              <span className="text-sm font-black text-primary-500">{netAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <DollarSign size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">정산 내역이 없어요</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-5">
          {Object.entries(grouped).map(([month, items]) => {
            const monthTotal = items.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900">{month}</p>
                  <p className="text-sm font-bold text-primary-500">{monthTotal.toLocaleString()}원</p>
                </div>
                <div className="space-y-2">
                  {items.map((item: any) => {
                    const otherName = isCaregiver
                      ? item.match?.guardian?.user?.name
                      : item.caregiver?.user?.name;
                    const settlementStatus = (item as any).settlementStatus || "PENDING";
                    const statusInfo = STATUS_MAP[settlementStatus] || STATUS_MAP.PENDING;
                    const itemFee = Math.round((item.totalAmount || 0) * PLATFORM_FEE_RATE);
                    const itemNet = (item.totalAmount || 0) - itemFee;
                    return (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{otherName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(item.scheduledDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                              {item.totalHours ? ` · ${item.totalHours}시간` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {isCaregiver ? "+" : "-"}{item.totalAmount?.toLocaleString()}원
                            </p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 border-t border-gray-50 pt-2">
                          <span>수수료 -{itemFee.toLocaleString()}원</span>
                          <span>·</span>
                          <span>실수령 {itemNet.toLocaleString()}원</span>
                        </div>
                        {/* Settlement Actions for guardians */}
                        {isGuardian && settlementStatus === "PENDING" && (
                          <SettlementActions sessionId={item.id} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
