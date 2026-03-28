import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { careRecipientSchema } from "@/lib/validations/profile";

async function getOwnedCareRecipient(userId: string, careRecipientId: string) {
  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) return null;
  return prisma.careRecipient.findFirst({ where: { id: careRecipientId, guardianId: guardianProfile.id } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const careRecipient = await getOwnedCareRecipient(userId, params.id);
  if (!careRecipient) {
    return NextResponse.json({ error: "어르신 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = careRecipientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.diseases && Array.isArray(data.diseases)) {
    data.diseases = JSON.stringify(data.diseases);
  }
  const updated = await prisma.careRecipient.update({ where: { id: params.id }, data });
  return NextResponse.json({ careRecipient: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const careRecipient = await getOwnedCareRecipient(userId, params.id);
  if (!careRecipient) {
    return NextResponse.json({ error: "어르신 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.careRecipient.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
