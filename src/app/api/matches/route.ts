import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createMatchSchema } from "@/lib/validations/match";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  let matches;
  if (role === "GUARDIAN") {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return NextResponse.json({ matches: [] });

    matches = await prisma.match.findMany({
      where: { guardianId: guardianProfile.id },
      orderBy: { requestedAt: "desc" },
      include: {
        caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        recipients: { include: { careRecipient: true } },
      },
    });
  } else {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return NextResponse.json({ matches: [] });

    matches = await prisma.match.findMany({
      where: { caregiverId: caregiverProfile.id },
      orderBy: { requestedAt: "desc" },
      include: {
        guardian: { include: { user: { select: { id: true, name: true, profileImage: true } }, careRecipients: true } },
        recipients: { include: { careRecipient: true } },
      },
    });
  }

  const result = matches.map((m) => ({ ...m, schedule: JSON.parse(m.schedule) }));
  return NextResponse.json({ matches: result });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  if (role !== "GUARDIAN") {
    return NextResponse.json({ error: "보호자 회원만 매칭을 요청할 수 있습니다." }, { status: 403 });
  }

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createMatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { caregiverId, serviceCategory, startDate, endDate, schedule, specialRequests, estimatedRate, careRecipientIds } = parsed.data;

  const caregiver = await prisma.caregiverProfile.findUnique({ where: { id: caregiverId } });
  if (!caregiver) {
    return NextResponse.json({ error: "요양보호사를 찾을 수 없습니다." }, { status: 404 });
  }

  const match = await prisma.match.create({
    data: {
      guardianId: guardianProfile.id,
      caregiverId,
      serviceCategory,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      schedule: JSON.stringify(schedule),
      specialRequests,
      estimatedRate,
      ...(careRecipientIds?.length
        ? { recipients: { create: careRecipientIds.map((careRecipientId) => ({ careRecipientId })) } }
        : {}),
    },
    include: { recipients: { include: { careRecipient: true } } },
  });

  return NextResponse.json({ match: { ...match, schedule: JSON.parse(match.schedule) } }, { status: 201 });
}
