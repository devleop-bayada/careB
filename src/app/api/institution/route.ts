import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

// GET /api/institution — 내 기관 정보 조회
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const member = await prisma.institutionMember.findFirst({
      where: { userId },
      include: { institution: true },
    });

    if (!member) {
      return NextResponse.json({ institution: null, member: null });
    }

    return NextResponse.json({
      institution: member.institution,
      member: { id: member.id, role: member.role },
    });
  } catch (err) {
    console.error("[GET /api/institution]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/institution — 기관 등록
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const body = await req.json();
    const { name, businessNumber, ltcNumber, type, address, phone, representativeName } = body;

    if (!name || !businessNumber || !type || !address || !phone || !representativeName) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    // 사업자등록번호 중복 체크
    const existing = await prisma.institution.findUnique({ where: { businessNumber } });
    if (existing) {
      return NextResponse.json({ error: "이미 등록된 사업자등록번호입니다." }, { status: 409 });
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        businessNumber,
        ltcNumber: ltcNumber || null,
        type,
        address,
        phone,
        representativeName,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
      include: { members: true },
    });

    // 사용자 역할을 INSTITUTION으로 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { role: "INSTITUTION" },
    });

    return NextResponse.json({ institution }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/institution]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
