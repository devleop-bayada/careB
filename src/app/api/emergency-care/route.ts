import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) {
      return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
    }

    const emergencyCares = await prisma.emergencyCare.findMany({
      where: { guardianId: guardianProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        matches: {
          include: {
            caregiver: {
              include: {
                user: { select: { id: true, name: true, profileImage: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ emergencyCares });
  } catch (err) {
    console.error("[GET /api/emergency-care]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) {
      return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
    }

    const body = await req.json();
    const { careRecipientId, date, hours, careType, message } = body;

    if (!date || !hours || !careType) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const careDate = new Date(date);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료

    // 가용 요양보호사 최대 5명 조회 (최근 활동 기준)
    const availableCaregivers = await prisma.caregiverProfile.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // 긴급 돌봄 요청 생성
    const emergencyCare = await prisma.emergencyCare.create({
      data: {
        guardianId: guardianProfile.id,
        careRecipientId: careRecipientId ?? null,
        careDate,
        startTime: "00:00",
        durationHours: parseInt(hours, 10),
        serviceType: careType,
        specialNotes: message ?? null,
        status: "PENDING",
        expiresAt,
      },
    });

    // 가용 요양보호사에게 매칭 요청 발송
    if (availableCaregivers.length > 0) {
      await prisma.emergencyCareMatch.createMany({
        data: availableCaregivers.map((cg) => ({
          emergencyCareId: emergencyCare.id,
          caregiverId: cg.id,
          status: "SENT",
        })),
      });
    }

    return NextResponse.json(
      {
        emergencyCareId: emergencyCare.id,
        sentCount: availableCaregivers.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/emergency-care]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
