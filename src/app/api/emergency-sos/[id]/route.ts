import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const sos = await prisma.emergencySOS.findUnique({ where: { id: params.id } });
  if (!sos) {
    return NextResponse.json({ error: "SOS 이벤트를 찾을 수 없습니다." }, { status: 404 });
  }

  if (sos.status !== "ACTIVE") {
    return NextResponse.json({ error: "이미 처리된 SOS 이벤트입니다." }, { status: 400 });
  }

  const body = await req.json();
  const { status, notes } = body;

  if (status !== "RESOLVED" && status !== "FALSE_ALARM") {
    return NextResponse.json({ error: "올바르지 않은 상태값입니다. (RESOLVED 또는 FALSE_ALARM)" }, { status: 400 });
  }

  const data: Record<string, unknown> = { status };
  if (status === "RESOLVED") data.resolvedAt = new Date();
  if (notes) data.notes = notes;

  const updated = await prisma.emergencySOS.update({ where: { id: params.id }, data });
  return NextResponse.json({ sos: updated });
}
