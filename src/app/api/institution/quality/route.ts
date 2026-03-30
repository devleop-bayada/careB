import { NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/quality — 품질 지표 집계
export async function GET() {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    // 소속 요양보호사 프로필 조회
    const staffList = await prisma.institutionStaff.findMany({
      where: { institutionId: institutionId!, status: "ACTIVE" },
      select: { caregiverId: true },
    });
    const caregiverUserIds = staffList.map((s) => s.caregiverId);

    if (caregiverUserIds.length === 0) {
      return NextResponse.json({
        journalSubmissionRate: 0,
        averageRating: 0,
        gpsComplianceRate: 0,
        totalSessions: 0,
        completedSessions: 0,
        journalCount: 0,
        staffCount: 0,
      });
    }

    const profiles = await prisma.caregiverProfile.findMany({
      where: { userId: { in: caregiverUserIds } },
      select: { id: true, averageRating: true },
    });
    const profileIds = profiles.map((p) => p.id);

    // 평균 평점
    const avgRating =
      profiles.length > 0
        ? profiles.reduce((sum, p) => sum + p.averageRating, 0) / profiles.length
        : 0;

    if (profileIds.length === 0) {
      return NextResponse.json({
        journalSubmissionRate: 0,
        averageRating: Math.round(avgRating * 10) / 10,
        gpsComplianceRate: 0,
        totalSessions: 0,
        completedSessions: 0,
        journalCount: 0,
        staffCount: staffList.length,
      });
    }

    // 최근 3개월 케어세션 조회
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const sessions = await prisma.careSession.findMany({
      where: {
        caregiverId: { in: profileIds },
        scheduledDate: { gte: threeMonthsAgo },
      },
      select: {
        id: true,
        status: true,
        checkInLat: true,
        checkInLng: true,
        checkOutLat: true,
        checkOutLng: true,
      },
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;

    // 일지 제출율
    const journalCount = await prisma.journal.count({
      where: {
        careSessionId: { in: sessions.map((s) => s.id) },
      },
    });
    const journalSubmissionRate = completedSessions > 0 ? Math.round((journalCount / completedSessions) * 100) : 0;

    // GPS 준수율 (체크인/체크아웃 GPS가 있는 세션 비율)
    const gpsCompliant = sessions.filter(
      (s) => s.status === "COMPLETED" && s.checkInLat !== null && s.checkOutLat !== null
    ).length;
    const gpsComplianceRate = completedSessions > 0 ? Math.round((gpsCompliant / completedSessions) * 100) : 0;

    return NextResponse.json({
      journalSubmissionRate,
      averageRating: Math.round(avgRating * 10) / 10,
      gpsComplianceRate,
      totalSessions,
      completedSessions,
      journalCount,
      staffCount: staffList.length,
    });
  } catch (err) {
    console.error("[GET /api/institution/quality]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
