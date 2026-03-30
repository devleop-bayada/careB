import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  return ["ADMIN", "OPERATOR"].includes(session?.user?.role);
}

// GET /api/admin/analytics/kpi
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // 병렬 집계
  const [
    totalUsers,
    guardianCount,
    caregiverCount,
    newUsersThisMonth,
    newUsersLastMonth,
    activeMatchCount,
    completedMatchCount,
    totalMatchCount,
    thisMonthPayment,
    lastMonthPayment,
    dailySignups,
    matchByStatus,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true, isBanned: false } }),
    prisma.user.count({ where: { role: "GUARDIAN", isActive: true } }),
    prisma.user.count({ where: { role: "CAREGIVER", isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.match.count({ where: { status: { in: ["ACCEPTED", "CONFIRMED", "IN_PROGRESS"] } } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    // 최근 30일 일별 가입자
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.match.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const matchingSuccessRate =
    totalMatchCount > 0 ? Math.round((completedMatchCount / totalMatchCount) * 100 * 10) / 10 : 0;

  const thisMonthAmount = thisMonthPayment._sum.amount ?? 0;
  const lastMonthAmount = lastMonthPayment._sum.amount ?? 0;
  const paymentChange =
    lastMonthAmount > 0
      ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 1000) / 10
      : 0;

  const newUserChange =
    newUsersLastMonth > 0
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 1000) / 10
      : 0;

  // 일별 가입 차트 데이터 (최근 30일)
  const signupMap = new Map<string, number>();
  for (const row of dailySignups) {
    signupMap.set(row.date, Number(row.count));
  }

  const labels: string[] = [];
  const signupValues: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    labels.push(label);
    signupValues.push(signupMap.get(key) ?? 0);
  }

  // 매칭 상태 분포
  const matchDistribution = matchByStatus.map((m) => ({
    status: m.status,
    count: m._count._all,
  }));

  return NextResponse.json({
    summary: {
      totalUsers,
      guardianCount,
      caregiverCount,
      newUsersThisMonth,
      newUserChange,
      activeMatchCount,
      completedMatchCount,
      totalMatchCount,
      matchingSuccessRate,
      thisMonthAmount,
      lastMonthAmount,
      paymentChange,
    },
    charts: {
      signupTrend: { labels, values: signupValues },
      matchDistribution,
    },
    lastUpdated: now.toISOString(),
  });
}
