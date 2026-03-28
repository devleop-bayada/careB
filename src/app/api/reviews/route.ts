import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createReviewSchema } from "@/lib/validations/review";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const caregiverId = searchParams.get("caregiverId");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;

    const where: Record<string, unknown> = { isVisible: true };
    if (caregiverId) where.targetId = caregiverId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const result = reviews.map((r) => ({ ...r, images: JSON.parse(r.images) }));
    return NextResponse.json({ reviews: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  if (role !== "GUARDIAN") {
    return NextResponse.json({ error: "보호자 회원만 리뷰를 작성할 수 있습니다." }, { status: 403 });
  }

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { careSessionId, overallRating, punctuality, attitude, professionalism, communication, healthCareSkill, content, images } = parsed.data;

  const careSession = await prisma.careSession.findUnique({
    where: { id: careSessionId },
    include: { review: true },
  });

  if (!careSession) {
    return NextResponse.json({ error: "돌봄 세션을 찾을 수 없습니다." }, { status: 404 });
  }
  if (careSession.review) {
    return NextResponse.json({ error: "이미 리뷰가 작성된 세션입니다." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      careSessionId,
      authorId: guardianProfile.id,
      targetId: careSession.caregiverId,
      overallRating,
      punctuality,
      attitude,
      professionalism,
      communication,
      healthCareSkill,
      content,
      images: JSON.stringify(images ?? []),
    },
  });

  // Update caregiver average rating
  const allReviews = await prisma.review.findMany({
    where: { targetId: careSession.caregiverId, isVisible: true },
    select: { overallRating: true },
  });
  const avg = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;
  await prisma.caregiverProfile.update({
    where: { id: careSession.caregiverId },
    data: { averageRating: Math.round(avg * 10) / 10, totalReviews: allReviews.length },
  });

  return NextResponse.json({ review: { ...review, images: JSON.parse(review.images) } }, { status: 201 });
}
