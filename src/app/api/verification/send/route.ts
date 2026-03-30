import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, type } = await req.json();

    // 전화번호 형식 검증
    if (!phone || !/^010-\d{4}-\d{4}$/.test(phone)) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식이 아닙니다. (010-xxxx-xxxx)" },
        { status: 400 }
      );
    }

    if (!type || !["SIGNUP", "LOGIN", "PASSWORD_RESET"].includes(type)) {
      return NextResponse.json(
        { error: "유효하지 않은 인증 타입입니다." },
        { status: 400 }
      );
    }

    // SIGNUP: 이미 가입된 번호인지 체크
    if (type === "SIGNUP") {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { error: "이미 가입된 전화번호입니다." },
          { status: 409 }
        );
      }
    }

    // 1분 내 재발송 방지 (쿨다운)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recent = await prisma.verificationCode.findFirst({
      where: {
        phone,
        type,
        createdAt: { gt: oneMinuteAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      const secondsLeft = Math.ceil(
        (recent.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: `${secondsLeft}초 후에 다시 시도해주세요.` },
        { status: 429 }
      );
    }

    // 일일 한도: 같은 번호로 하루 최대 5회
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyCount = await prisma.verificationCode.count({
      where: {
        phone,
        type,
        createdAt: { gte: startOfDay },
      },
    });
    const DAILY_LIMIT = 5;
    if (dailyCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "일일 인증 횟수를 초과했습니다. 내일 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // IP 기반 제한: 하루 최대 10회
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (ip !== "unknown") {
      // IP 제한은 별도 테이블 없이 간단히 처리 (phone prefix 로 근사)
      // 실제 IP 기반 rate limiting은 Redis 등이 필요하므로 현재는 로그만 기록
      console.log(`[SMS 인증] IP=${ip} phone=${phone}`);
    }

    // 6자리 코드 생성
    const code = Math.random().toString().slice(2, 8).padEnd(6, "0");

    // DB 저장 (3분 유효)
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    await prisma.verificationCode.create({
      data: { phone, code, type, expiresAt },
    });

    // 개발용: console.log
    console.log(`[SMS 인증코드] phone=${phone} type=${type} code=${code}`);

    const skipSms = process.env.SKIP_SMS_VERIFICATION === "true";
    const remainingToday = DAILY_LIMIT - dailyCount - 1;

    return NextResponse.json({
      success: true,
      message: "인증코드가 발송되었습니다.",
      remainingToday,
      dailyLimit: DAILY_LIMIT,
      ...(skipSms ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error("[verification/send] error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
