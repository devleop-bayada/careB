import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/notices — 공지사항 목록
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const status = searchParams.get("status") ?? undefined;
  const target = searchParams.get("target") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const where: any = {};
  if (status) where.status = status;
  if (target) where.target = target;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.notice.count({ where }),
  ]);

  return NextResponse.json({ notices, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/admin/notices — 공지사항 생성
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, target, isPinned, publishAt, expiresAt, status } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 });
  }

  // 상단 고정 최대 3개 체크
  if (isPinned) {
    const pinnedCount = await prisma.notice.count({
      where: { isPinned: true, status: "PUBLISHED" },
    });
    if (pinnedCount >= 3) {
      return NextResponse.json(
        { error: "상단 고정은 최대 3개까지 가능합니다. 기존 고정을 해제해주세요." },
        { status: 400 }
      );
    }
  }

  const authorId = (session.user as any).id;

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      target: target ?? "ALL",
      isPinned: isPinned ?? false,
      status: status ?? (publishAt ? "SCHEDULED" : "PUBLISHED"),
      publishAt: publishAt ? new Date(publishAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      authorId,
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ notice }, { status: 201 });
}
