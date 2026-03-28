import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const coGuardian = await prisma.coGuardian.findUnique({
    where: { id: params.id },
    include: { member: true },
  });

  if (!coGuardian) {
    return NextResponse.json({ error: "공동보호자 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // Only the invited member can accept/reject
  const memberProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!memberProfile || memberProfile.id !== coGuardian.memberId) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const { status } = body;

  if (status !== "ACCEPTED" && status !== "REJECTED") {
    return NextResponse.json({ error: "올바르지 않은 상태값입니다. (ACCEPTED 또는 REJECTED)" }, { status: 400 });
  }

  const updated = await prisma.coGuardian.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ coGuardian: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const coGuardian = await prisma.coGuardian.findUnique({ where: { id: params.id } });
  if (!coGuardian) {
    return NextResponse.json({ error: "공동보호자 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // Owner or member can remove
  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile || (guardianProfile.id !== coGuardian.ownerId && guardianProfile.id !== coGuardian.memberId)) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await prisma.coGuardian.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
