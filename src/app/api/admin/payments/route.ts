import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/payments — 결제 목록 + 통계
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
  const fromDate = searchParams.get("from") ?? undefined;
  const toDate = searchParams.get("to") ?? undefined;
  const tab = searchParams.get("tab") ?? "payments"; // payments | refunds

  const where: any = {};
  if (tab === "refunds") {
    where.status = "REFUNDED";
  } else if (status) {
    where.status = status;
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate + "T23:59:59Z");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [payments, total, totalRevenue, monthRevenue, refundTotal] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "REFUNDED" },
      _sum: { amount: true },
    }),
  ]);

  // 플랫폼 수수료 수입 (정산 기준)
  const feeIncome = await prisma.settlement.aggregate({
    _sum: { platformFee: true },
  });

  return NextResponse.json({
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalRevenue: totalRevenue._sum.amount ?? 0,
      monthRevenue: monthRevenue._sum.amount ?? 0,
      totalRefund: refundTotal._sum.amount ?? 0,
      feeIncome: feeIncome._sum.platformFee ?? 0,
    },
  });
}
