import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const PASS_TYPE_MAP: Record<string, { type: string; total: number }> = {
  PASS_SINGLE: { type: "SINGLE", total: 1 },
  PASS_FIVE:   { type: "FIVE",   total: 5 },
  PASS_TEN:    { type: "TEN",    total: 10 },
};

const SUB_PLAN_MAP: Record<string, string> = {
  SUB_STANDARD: "STANDARD",
  SUB_PREMIUM:  "PREMIUM",
  SUB_FAMILY:   "FAMILY",
};

// POST: 결제 확인 및 처리 (현재는 즉시 COMPLETED 시뮬레이션)
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const body = await req.json();
    const { orderId, paymentKey, amount } = body;

    if (!orderId) {
      return NextResponse.json({ error: "주문번호가 없습니다." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { orderId } });

    if (!payment) {
      return NextResponse.json({ error: "결제 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    if (payment.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({ error: "이미 완료된 결제입니다." }, { status: 400 });
    }

    // 금액 검증
    if (amount && payment.amount !== amount) {
      await prisma.payment.update({
        where: { orderId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
    }

    // 결제 완료 처리 (PG 시뮬레이션)
    const updatedPayment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: "COMPLETED",
        paymentKey: paymentKey ?? `SIM_${Date.now()}`,
      },
    });

    // 상품 유형에 따라 이용권 또는 구독 생성
    const { productType } = payment;

    if (PASS_TYPE_MAP[productType]) {
      const { type, total } = PASS_TYPE_MAP[productType];
      await prisma.pass.create({
        data: {
          userId,
          type: type as any,
          total,
          remaining: total,
        },
      });
    } else if (SUB_PLAN_MAP[productType]) {
      const plan = SUB_PLAN_MAP[productType];

      // 기존 활성 구독 취소
      await prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          userId,
          plan: plan as any,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
      });
    }

    return NextResponse.json({ payment: updatedPayment, success: true });
  } catch (err) {
    console.error("[POST /api/payments/confirm]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
