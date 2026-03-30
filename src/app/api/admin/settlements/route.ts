import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/settlements — 정산 목록
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

  const where: any = {};
  if (status) where.status = status;

  const [settlements, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: {
        caregiver: {
          select: {
            user: { select: { name: true } },
          },
        },
        careSession: {
          select: { scheduledDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.settlement.count({ where }),
  ]);

  return NextResponse.json({
    settlements,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// PATCH /api/admin/settlements — 정산 일괄 처리
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const { ids, action } = body; // ids: string[], action: "confirm" | "pay" | "cancel"

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "정산 ID를 지정해주세요." }, { status: 400 });
  }

  let updateData: any = {};
  if (action === "confirm") {
    updateData = { status: "CONFIRMED", confirmedAt: new Date() };
  } else if (action === "pay") {
    updateData = { status: "PAID", paidAt: new Date() };
  } else if (action === "cancel") {
    updateData = { status: "CANCELLED" };
  } else {
    return NextResponse.json({ error: "잘못된 액션입니다." }, { status: 400 });
  }

  const result = await prisma.settlement.updateMany({
    where: { id: { in: ids } },
    data: updateData,
  });

  return NextResponse.json({ updated: result.count });
}
