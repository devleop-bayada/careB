import { NextRequest, NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/claims — 급여 청구 목록
export async function GET(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") ?? undefined;

    const where: any = { institutionId: institutionId! };
    if (statusFilter) where.status = statusFilter;

    const claims = await prisma.institutionClaim.findMany({
      where,
      orderBy: { yearMonth: "desc" },
    });

    return NextResponse.json({ claims });
  } catch (err) {
    console.error("[GET /api/institution/claims]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/institution/claims — 청구서 생성
export async function POST(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const body = await req.json();
    const { yearMonth } = body;

    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      return NextResponse.json({ error: "올바른 청구 연월을 입력해주세요. (예: 2026-03)" }, { status: 400 });
    }

    // 이미 해당 월 청구가 있는지 확인
    const existing = await prisma.institutionClaim.findFirst({
      where: { institutionId: institutionId!, yearMonth },
    });
    if (existing) {
      return NextResponse.json({ error: "해당 월의 청구서가 이미 존재합니다." }, { status: 409 });
    }

    // 돌봄 기록 기반 자동 계산
    const [year, month] = yearMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    // 소속 요양보호사 프로필 ID 조회
    const staffList = await prisma.institutionStaff.findMany({
      where: { institutionId: institutionId!, status: "ACTIVE" },
      select: { caregiverId: true },
    });
    const caregiverUserIds = staffList.map((s) => s.caregiverId);

    let totalAmount = 0;

    if (caregiverUserIds.length > 0) {
      const profiles = await prisma.caregiverProfile.findMany({
        where: { userId: { in: caregiverUserIds } },
        select: { id: true },
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length > 0) {
        const sessions = await prisma.careSession.findMany({
          where: {
            caregiverId: { in: profileIds },
            scheduledDate: { gte: monthStart, lte: monthEnd },
            status: "COMPLETED",
          },
          select: { totalAmount: true },
        });
        totalAmount = sessions.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0);
      }
    }

    const claim = await prisma.institutionClaim.create({
      data: {
        institutionId: institutionId!,
        yearMonth,
        totalAmount,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/institution/claims]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
