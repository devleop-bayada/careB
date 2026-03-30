import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: 교육 상세
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const education = await prisma.education.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!education) {
      return NextResponse.json({ error: "교육을 찾을 수 없습니다." }, { status: 404 });
    }

    // 로그인 상태면 수강 정보도 가져옴
    let enrollment = null;
    try {
      const { session } = await requireAuth();
      if (session) {
        const user = session.user as any;
        enrollment = await prisma.educationEnrollment.findUnique({
          where: { userId_educationId: { userId: user.id, educationId: params.id } },
        });
      }
    } catch {
      // 비로그인 상태 무시
    }

    return NextResponse.json({ education, enrollment });
  } catch (err) {
    console.error("[GET /api/education/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// PATCH: 진도 업데이트 / 수료 처리
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  try {
    const body = await req.json();
    const { progress, isCompleted } = body;

    const enrollment = await prisma.educationEnrollment.findUnique({
      where: { userId_educationId: { userId: user.id, educationId: params.id } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "수강 신청 내역이 없습니다." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof progress === "number") {
      updateData.progress = Math.min(100, Math.max(0, progress));
    }
    if (isCompleted === true) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    const updated = await prisma.educationEnrollment.update({
      where: { id: enrollment.id },
      data: updateData,
    });

    return NextResponse.json({ enrollment: updated });
  } catch (err) {
    console.error("[PATCH /api/education/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
