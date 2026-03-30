import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/matching — 매칭 목록 + 통계
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
  const region = searchParams.get("region") ?? undefined;
  const fromDate = searchParams.get("from") ?? undefined;
  const toDate = searchParams.get("to") ?? undefined;

  const where: any = {};
  if (status) where.status = status;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate + "T23:59:59Z");
  }
  // 지역 필터: guardian profile의 region으로 필터
  if (region) {
    where.guardian = { region: { contains: region, mode: "insensitive" } };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    matches,
    total,
    activeCount,
    todayNewCount,
    completedCount,
    totalMatchCount,
  ] = await Promise.all([
    prisma.match.findMany({
      where,
      include: {
        guardian: {
          select: {
            region: true,
            user: { select: { name: true } },
          },
        },
        caregiver: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.match.count({ where }),
    prisma.match.count({ where: { status: { in: ["PENDING", "ACCEPTED", "CONFIRMED", "IN_PROGRESS"] } } }),
    prisma.match.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count(),
  ]);

  // 평균 응답 시간 (수락된 매칭의 requestedAt -> respondedAt 차이)
  const respondedMatches = await prisma.match.findMany({
    where: { respondedAt: { not: null } },
    select: { requestedAt: true, respondedAt: true },
    take: 100,
    orderBy: { respondedAt: "desc" },
  });

  let avgResponseHours = 0;
  if (respondedMatches.length > 0) {
    const totalHours = respondedMatches.reduce((sum, m) => {
      const diff = (m.respondedAt!.getTime() - m.requestedAt.getTime()) / (1000 * 60 * 60);
      return sum + diff;
    }, 0);
    avgResponseHours = Math.round((totalHours / respondedMatches.length) * 10) / 10;
  }

  const successRate = totalMatchCount > 0
    ? Math.round((completedCount / totalMatchCount) * 1000) / 10
    : 0;

  return NextResponse.json({
    matches,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: {
      activeCount,
      todayNewCount,
      successRate,
      avgResponseHours,
    },
  });
}
