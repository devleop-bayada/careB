import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { updateMatchStatusSchema, VALID_STATUS_TRANSITIONS } from "@/lib/validations/match";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      guardian: { include: { user: { select: { id: true, name: true, profileImage: true } }, careRecipients: true } },
      caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } }, certificates: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true, profileImage: true } } } },
      recipients: { include: { careRecipient: true } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ match: { ...match, schedule: JSON.parse(match.schedule) } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateMatchStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, cancelReason } = parsed.data;

  // State machine validation
  const allowedTransitions = VALID_STATUS_TRANSITIONS[match.status] ?? [];
  if (!allowedTransitions.includes(status)) {
    return NextResponse.json(
      { error: `'${match.status}' 상태에서 '${status}' 상태로 변경할 수 없습니다.` },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = { status };
  if (status === "ACCEPTED" || status === "REJECTED") data.respondedAt = new Date();
  if (status === "CONFIRMED") data.confirmedAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();
  if (status === "CANCELLED") {
    data.cancelledAt = new Date();
    if (cancelReason) data.cancelReason = cancelReason;
  }

  const updated = await prisma.match.update({ where: { id: params.id }, data });
  return NextResponse.json({ match: { ...updated, schedule: JSON.parse(updated.schedule) } });
}
