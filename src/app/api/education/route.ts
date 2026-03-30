import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: 교육 목록
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const educations = await prisma.education.findMany({
      where,
      orderBy: [{ isRequired: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json({ educations });
  } catch (err) {
    console.error("[GET /api/education]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 수강 신청
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  try {
    const { educationId } = await req.json();
    if (!educationId) {
      return NextResponse.json({ error: "교육 ID가 필요합니다." }, { status: 400 });
    }

    // 이미 수강 중인지 확인
    const existing = await prisma.educationEnrollment.findUnique({
      where: { userId_educationId: { userId: user.id, educationId } },
    });

    if (existing) {
      return NextResponse.json({ error: "이미 수강 중인 교육입니다.", enrollment: existing }, { status: 409 });
    }

    const enrollment = await prisma.educationEnrollment.create({
      data: {
        userId: user.id,
        educationId,
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/education]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
