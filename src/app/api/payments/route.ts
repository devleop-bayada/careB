import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const PRODUCT_PRICES: Record<string, number> = {
  PASS_SINGLE:   3900,
  PASS_FIVE:    15000,
  PASS_TEN:     25000,
  SUB_STANDARD: 29900,
  SUB_PREMIUM:  59900,
  SUB_FAMILY:   99900,
};

// GET: 현재 사용자의 결제 내역
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("[GET /api/payments]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 결제 요청 생성 (orderId 생성)
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const body = await req.json();
    const { productType } = body;

    if (!productType || !PRODUCT_PRICES[productType]) {
      return NextResponse.json({ error: "유효하지 않은 상품 유형입니다." }, { status: 400 });
    }

    const amount = PRODUCT_PRICES[productType];
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: "PENDING",
        orderId,
        productType,
      },
    });

    return NextResponse.json({ payment, orderId, amount }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/payments]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
