import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { action, reason } = body;

    if (!action || !["confirm", "dispute"].includes(action)) {
      return NextResponse.json({ error: "유효하지 않은 action입니다." }, { status: 400 });
    }

    if (action === "dispute" && !reason?.trim()) {
      return NextResponse.json({ error: "이의 사유를 입력해주세요." }, { status: 400 });
    }

    const settlement = await prisma.settlement.findUnique({
      where: { careSessionId: params.id },
    });

    if (!settlement) {
      return NextResponse.json({ error: "정산 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const now = new Date();

    if (action === "confirm") {
      const updated = await prisma.settlement.update({
        where: { careSessionId: params.id },
        data: { status: "CONFIRMED", confirmedAt: now },
      });
      return NextResponse.json({ settlement: updated });
    }

    // action === "dispute"
    const updated = await prisma.settlement.update({
      where: { careSessionId: params.id },
      data: { status: "DISPUTED", disputedAt: now, disputeReason: reason },
    });
    return NextResponse.json({ settlement: updated });
  } catch (err) {
    console.error("[POST /api/care-sessions/[id]/settlement]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
