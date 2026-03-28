import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const bookmark = await prisma.bookmark.findUnique({ where: { id: params.id } });
  if (!bookmark) {
    return NextResponse.json({ error: "즐겨찾기를 찾을 수 없습니다." }, { status: 404 });
  }

  if (bookmark.userId !== userId) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await prisma.bookmark.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
