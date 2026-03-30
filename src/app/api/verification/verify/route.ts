import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, type } = await req.json();

    if (!phone || !code || !type) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 해당 phone + type의 최신 미검증 레코드 조회
    const record = await prisma.verificationCode.findFirst({
      where: {
        phone,
        type,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "인증코드를 먼저 발송해주세요." },
        { status: 404 }
      );
    }

    // 시도 횟수 초과
    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: "인증 시도 횟수를 초과했습니다. 코드를 재발송해주세요." },
        { status: 429 }
      );
    }

    // 만료 확인
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "인증코드가 만료되었습니다." },
        { status: 410 }
      );
    }

    // 코드 불일치
    if (record.code !== code) {
      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      const remaining = 4 - record.attempts;
      return NextResponse.json(
        {
          error: `인증코드가 올바르지 않습니다. (남은 시도: ${remaining}회)`,
        },
        { status: 400 }
      );
    }

    // 코드 일치 → verified = true
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("[verification/verify] error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
