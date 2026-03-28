import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const settlement = await prisma.settlement.findUnique({ where: { id: params.id } });
  if (!settlement) {
    return NextResponse.json({ error: "정산 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const { action, disputeReason } = body;

  if (!action) {
    return NextResponse.json({ error: "액션이 필요합니다." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (action === "confirm") {
    if (settlement.status !== "PENDING") {
      return NextResponse.json({ error: "대기 중인 정산만 확인할 수 있습니다." }, { status: 400 });
    }
    data.status = "CONFIRMED";
    data.confirmedAt = new Date();
  } else if (action === "dispute") {
    if (settlement.status !== "PENDING") {
      return NextResponse.json({ error: "대기 중인 정산만 이의를 제기할 수 있습니다." }, { status: 400 });
    }

    // Check 72-hour window
    const hoursElapsed = (Date.now() - settlement.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 72) {
      return NextResponse.json({ error: "이의 제기 기간(72시간)이 지났습니다." }, { status: 400 });
    }

    data.status = "DISPUTED";
    data.disputedAt = new Date();
    if (disputeReason) data.disputeReason = disputeReason;
  } else if (action === "pay") {
    if (settlement.status !== "CONFIRMED") {
      return NextResponse.json({ error: "확인된 정산만 지급할 수 있습니다." }, { status: 400 });
    }
    data.status = "PAID";
    data.paidAt = new Date();
  } else {
    return NextResponse.json({ error: "올바르지 않은 액션입니다." }, { status: 400 });
  }

  const updated = await prisma.settlement.update({ where: { id: params.id }, data });
  return NextResponse.json({ settlement: updated });
}
