import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  let contracts;
  if (role === "GUARDIAN") {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return NextResponse.json({ contracts: [] });

    contracts = await prisma.contract.findMany({
      where: { match: { guardianId: guardianProfile.id } },
      orderBy: { createdAt: "desc" },
      include: {
        match: {
          include: {
            caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
          },
        },
      },
    });
  } else {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return NextResponse.json({ contracts: [] });

    contracts = await prisma.contract.findMany({
      where: { match: { caregiverId: caregiverProfile.id } },
      orderBy: { createdAt: "desc" },
      include: {
        match: {
          include: {
            guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
          },
        },
      },
    });
  }

  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { matchId } = body;

  if (!matchId) {
    return NextResponse.json({ error: "매칭 ID가 필요합니다." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { caregiver: true, contract: true },
  });

  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  if (match.contract) {
    return NextResponse.json({ error: "이미 계약서가 존재합니다." }, { status: 409 });
  }

  const contract = await prisma.contract.create({
    data: {
      matchId: match.id,
      serviceCategory: match.serviceCategory,
      hourlyRate: match.estimatedRate ?? match.caregiver.hourlyRate,
      schedule: match.schedule,
      startDate: match.startDate,
      endDate: match.endDate,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
