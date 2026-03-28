import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  let settlements;
  if (role === "CAREGIVER") {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return NextResponse.json({ settlements: [] });

    settlements = await prisma.settlement.findMany({
      where: { caregiverId: caregiverProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        careSession: {
          include: {
            match: { include: { guardian: { include: { user: { select: { id: true, name: true } } } } } },
          },
        },
      },
    });
  } else {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return NextResponse.json({ settlements: [] });

    settlements = await prisma.settlement.findMany({
      where: { careSession: { match: { guardianId: guardianProfile.id } } },
      orderBy: { createdAt: "desc" },
      include: {
        caregiver: { include: { user: { select: { id: true, name: true } } } },
        careSession: true,
      },
    });
  }

  return NextResponse.json({ settlements });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { careSessionId } = body;

  if (!careSessionId) {
    return NextResponse.json({ error: "돌봄 세션 ID가 필요합니다." }, { status: 400 });
  }

  const careSession = await prisma.careSession.findUnique({
    where: { id: careSessionId },
    include: { settlement: true },
  });

  if (!careSession) {
    return NextResponse.json({ error: "돌봄 세션을 찾을 수 없습니다." }, { status: 404 });
  }

  if (careSession.settlement) {
    return NextResponse.json({ error: "이미 정산이 존재합니다." }, { status: 409 });
  }

  if (!careSession.totalAmount) {
    return NextResponse.json({ error: "총 금액이 계산되지 않았습니다." }, { status: 400 });
  }

  const amount = careSession.totalAmount;
  const platformFee = Math.round(amount * 0.03);
  const netAmount = amount - platformFee;

  const settlement = await prisma.settlement.create({
    data: {
      careSessionId,
      caregiverId: careSession.caregiverId,
      amount,
      platformFee,
      netAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json({ settlement }, { status: 201 });
}
