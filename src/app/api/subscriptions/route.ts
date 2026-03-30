import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const SUB_PRODUCTS = {
  STANDARD: { amount: 29900, label: "스탠다드" },
  PREMIUM:  { amount: 59900, label: "프리미엄" },
  FAMILY:   { amount: 99900, label: "패밀리케어" },
} as const;

// GET: 현재 구독 상태
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("[GET /api/subscriptions]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 구독 시작
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const body = await req.json();
    const { plan, orderId } = body;

    if (!plan || !["STANDARD", "PREMIUM", "FAMILY"].includes(plan)) {
      return NextResponse.json({ error: "유효하지 않은 구독 플랜입니다." }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "주문번호가 없습니다." }, { status: 400 });
    }

    // 결제 확인
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.userId !== userId || payment.status !== "COMPLETED") {
      return NextResponse.json({ error: "완료된 결제 내역이 없습니다." }, { status: 400 });
    }

    // 기존 활성 구독 취소
    await prisma.subscription.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/subscriptions]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// PATCH: 구독 취소
export async function PATCH() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json({ error: "활성 구독이 없습니다." }, { status: 404 });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ subscription: updated });
  } catch (err) {
    console.error("[PATCH /api/subscriptions]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
