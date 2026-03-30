import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/members — 회원 목록 + 검색 + 필터 + 페이지네이션
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const role = searchParams.get("role") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const fromDate = searchParams.get("from") ?? undefined;
  const toDate = searchParams.get("to") ?? undefined;

  const where: any = {};
  if (role) where.role = role;
  if (status === "active") {
    where.isActive = true;
    where.isBanned = false;
  } else if (status === "banned") {
    where.isBanned = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate + "T23:59:59Z");
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // 매칭 수 추가 (보호자/요양보호사별)
  const membersWithMatchCount = await Promise.all(
    members.map(async (m) => {
      let matchCount = 0;
      if (m.role === "GUARDIAN") {
        const gp = await prisma.guardianProfile.findUnique({ where: { userId: m.id }, select: { id: true } });
        if (gp) matchCount = await prisma.match.count({ where: { guardianId: gp.id } });
      } else if (m.role === "CAREGIVER") {
        const cp = await prisma.caregiverProfile.findUnique({ where: { userId: m.id }, select: { id: true } });
        if (cp) matchCount = await prisma.match.count({ where: { caregiverId: cp.id } });
      }
      return { ...m, matchCount };
    })
  );

  return NextResponse.json({
    members: membersWithMatchCount,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
