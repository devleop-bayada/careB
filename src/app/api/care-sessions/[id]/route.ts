import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const careSession = await prisma.careSession.findUnique({
    where: { id: params.id },
    include: {
      caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      match: { include: { guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } } } },
      recipients: { include: { careRecipient: true } },
      journals: true,
      review: true,
    },
  });

  if (!careSession) {
    return NextResponse.json({ error: "돌봄 세션을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ session: careSession });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { status, actualStart, actualEnd, totalHours, totalAmount, notes } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (actualStart !== undefined) data.actualStart = new Date(actualStart);
  if (actualEnd !== undefined) data.actualEnd = new Date(actualEnd);
  if (totalHours !== undefined) data.totalHours = totalHours;
  if (totalAmount !== undefined) data.totalAmount = totalAmount;
  if (notes !== undefined) data.notes = notes;

  const updated = await prisma.careSession.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ session: updated });
}
