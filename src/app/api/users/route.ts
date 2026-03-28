import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone, password, name, email, role } = parsed.data;

    // 전화번호 정규화 (010-XXXX-XXXX 형식)
    const normalizedPhone = phone.replace(/-/g, "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");

    const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 전화번호입니다." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        email,
        passwordHash,
        name,
        role,
        ...(role === "GUARDIAN"
          ? { guardianProfile: { create: {} } }
          : {
              caregiverProfile: {
                create: {
                  gender: body.gender ?? "FEMALE",
                },
              },
            }),
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
