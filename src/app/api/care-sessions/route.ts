import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  let sessions;
  if (role === "CAREGIVER") {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return NextResponse.json({ sessions: [] });

    sessions = await prisma.careSession.findMany({
      where: { caregiverId: caregiverProfile.id },
      orderBy: { scheduledDate: "desc" },
      include: {
        match: { include: { guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } } } },
        recipients: { include: { careRecipient: true } },
        journals: true,
        review: true,
      },
    });
  } else {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return NextResponse.json({ sessions: [] });

    sessions = await prisma.careSession.findMany({
      where: { match: { guardianId: guardianProfile.id } },
      orderBy: { scheduledDate: "desc" },
      include: {
        caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        recipients: { include: { careRecipient: true } },
        journals: true,
        review: true,
      },
    });
  }

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { matchId, scheduledDate, startTime, endTime, hourlyRate, careRecipientIds } = body;

  if (!matchId || !scheduledDate || !startTime || !endTime || !hourlyRate) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const careSession = await prisma.careSession.create({
    data: {
      matchId,
      caregiverId: match.caregiverId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      hourlyRate,
      ...(careRecipientIds?.length
        ? { recipients: { create: (careRecipientIds as string[]).map((careRecipientId) => ({ careRecipientId })) } }
        : {}),
    },
    include: { recipients: { include: { careRecipient: true } } },
  });

  return NextResponse.json({ session: careSession }, { status: 201 });
}
