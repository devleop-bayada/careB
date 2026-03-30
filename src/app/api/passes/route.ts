import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const PASS_PRODUCTS = {
  SINGLE: { total: 1, amount: 3900, label: "1회 이용권" },
  FIVE:   { total: 5, amount: 15000, label: "5회 이용권" },
  TEN:    { total: 10, amount: 25000, label: "10회 이용권" },
} as const;

// GET: 현재 사용자의 이용권 목록
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const passes = await prisma.pass.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ passes });
  } catch (err) {
    console.error("[GET /api/passes]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 이용권 구매 (결제 완료 후 이용권 생성)
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const body = await req.json();
    const { type, orderId } = body;

    if (!type || !["SINGLE", "FIVE", "TEN"].includes(type)) {
      return NextResponse.json({ error: "유효하지 않은 이용권 유형입니다." }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "주문번호가 없습니다." }, { status: 400 });
    }

    // 결제 확인
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.userId !== userId || payment.status !== "COMPLETED") {
      return NextResponse.json({ error: "완료된 결제 내역이 없습니다." }, { status: 400 });
    }

    const product = PASS_PRODUCTS[type as keyof typeof PASS_PRODUCTS];

    const pass = await prisma.pass.create({
      data: {
        userId,
        type,
        total: product.total,
        remaining: product.total,
      },
    });

    return NextResponse.json({ pass }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/passes]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
