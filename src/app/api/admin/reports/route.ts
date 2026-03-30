import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/reports — 신고 목록
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
  const type = searchParams.get("type") ?? undefined;
  const fromDate = searchParams.get("from") ?? undefined;
  const toDate = searchParams.get("to") ?? undefined;

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate + "T23:59:59Z");
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { name: true, role: true } },
        target: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    reports,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
