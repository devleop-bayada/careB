import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const notification = await prisma.notification.findFirst({
    where: { id: params.id, userId },
  });

  if (!notification) {
    return NextResponse.json({ error: "알림을 찾을 수 없습니다." }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json({ notification: updated });
}
