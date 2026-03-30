import { NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/dashboard — 대시보드 KPI
export async function GET() {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 소속 요양보호사 수
    const staffCount = await prisma.institutionStaff.count({
      where: { institutionId: institutionId!, status: "ACTIVE" },
    });

    // 이용자 수
    const recipientCount = await prisma.institutionRecipient.count({
      where: { institutionId: institutionId!, status: "ACTIVE" },
    });

    // 이번 달 청구 현황
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const claims = await prisma.institutionClaim.findMany({
      where: { institutionId: institutionId!, yearMonth },
    });

    const claimTotal = claims.reduce((sum, c) => sum + c.totalAmount, 0);
    const claimCount = claims.length;

    // 이번 달 돌봄 시간 (소속 요양보호사의 케어세션 기반)
    const staffList = await prisma.institutionStaff.findMany({
      where: { institutionId: institutionId!, status: "ACTIVE" },
      select: { caregiverId: true },
    });
    const caregiverUserIds = staffList.map((s) => s.caregiverId);

    let totalCareHours = 0;
    if (caregiverUserIds.length > 0) {
      // 요양보호사 프로필 ID 조회
      const profiles = await prisma.caregiverProfile.findMany({
        where: { userId: { in: caregiverUserIds } },
        select: { id: true },
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length > 0) {
        const sessions = await prisma.careSession.findMany({
          where: {
            caregiverId: { in: profileIds },
            scheduledDate: { gte: thisMonthStart, lte: thisMonthEnd },
            status: { in: ["COMPLETED", "IN_PROGRESS"] },
          },
          select: { totalHours: true },
        });
        totalCareHours = sessions.reduce((sum, s) => sum + (s.totalHours ?? 0), 0);
      }
    }

    return NextResponse.json({
      staffCount,
      recipientCount,
      totalCareHours: Math.round(totalCareHours * 10) / 10,
      claimTotal,
      claimCount,
      claimStatuses: claims.map((c) => ({ status: c.status, amount: c.totalAmount })),
    });
  } catch (err) {
    console.error("[GET /api/institution/dashboard]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
