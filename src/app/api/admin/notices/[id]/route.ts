import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/notices/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const notice = await prisma.notice.findUnique({
    where: { id: params.id },
    include: { author: { select: { name: true } } },
  });

  if (!notice) return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ notice });
}

// PATCH /api/admin/notices/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, target, isPinned, publishAt, expiresAt, status } = body;

  // 상단 고정 최대 3개 체크 (현재 공지 제외)
  if (isPinned) {
    const pinnedCount = await prisma.notice.count({
      where: { isPinned: true, status: "PUBLISHED", id: { not: params.id } },
    });
    if (pinnedCount >= 3) {
      return NextResponse.json(
        { error: "상단 고정은 최대 3개까지 가능합니다. 기존 고정을 해제해주세요." },
        { status: 400 }
      );
    }
  }

  const notice = await prisma.notice.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(target !== undefined && { target }),
      ...(isPinned !== undefined && { isPinned }),
      ...(status !== undefined && { status }),
      ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ notice });
}

// DELETE /api/admin/notices/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  await prisma.notice.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
