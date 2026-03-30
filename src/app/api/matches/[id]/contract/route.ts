import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: 계약서 조회 (없으면 자동 생성)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const matchId = params.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      caregiver: true,
      contract: true,
    },
  });

  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // 계약서가 없으면 자동 생성
  if (!match.contract) {
    const contract = await prisma.contract.create({
      data: {
        matchId: match.id,
        serviceCategory: match.serviceCategory,
        hourlyRate: match.estimatedRate ?? match.caregiver.hourlyRate,
        schedule: match.schedule,
        startDate: match.startDate,
        endDate: match.endDate ?? undefined,
        status: "DRAFT",
      },
    });
    return NextResponse.json({ contract });
  }

  return NextResponse.json({ contract: match.contract });
}

// POST: 서명 처리
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const matchId = params.id;
  const body = await req.json();
  const { party } = body as { party: "guardian" | "caregiver" };

  if (!party || !["guardian", "caregiver"].includes(party)) {
    return NextResponse.json({ error: "party 값이 올바르지 않습니다. (guardian | caregiver)" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { caregiver: true, contract: true },
  });

  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // 계약서가 없으면 먼저 생성
  let contract = match.contract;
  if (!contract) {
    contract = await prisma.contract.create({
      data: {
        matchId: match.id,
        serviceCategory: match.serviceCategory,
        hourlyRate: match.estimatedRate ?? match.caregiver.hourlyRate,
        schedule: match.schedule,
        startDate: match.startDate,
        endDate: match.endDate ?? undefined,
        status: "DRAFT",
      },
    });
  }

  const data: Record<string, unknown> = {};

  if (party === "guardian") {
    if (contract.guardianSigned) {
      return NextResponse.json({ error: "이미 서명했습니다." }, { status: 409 });
    }
    data.guardianSigned = true;
    data.guardianSignedAt = new Date();
    data.status = contract.caregiverSigned ? "ACTIVE" : "PENDING_SIGN";
  } else {
    if (contract.caregiverSigned) {
      return NextResponse.json({ error: "이미 서명했습니다." }, { status: 409 });
    }
    data.caregiverSigned = true;
    data.caregiverSignedAt = new Date();
    data.status = contract.guardianSigned ? "ACTIVE" : "PENDING_SIGN";
  }

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data,
  });

  // 양측 서명 완료 시 매칭 상태를 IN_PROGRESS로 업데이트
  if (updated.guardianSigned && updated.caregiverSigned) {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json({ contract: updated });
}
