import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: 포트폴리오 데이터 집계
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  try {
    // 요양보호사 프로필
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { name: true, profileImage: true } },
        certificates: { where: { verificationStatus: "VERIFIED" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "요양보호사 프로필이 없습니다." }, { status: 404 });
    }

    // 수료한 교육 목록
    const completedEducations = await prisma.educationEnrollment.findMany({
      where: { userId: user.id, isCompleted: true },
      include: { education: { select: { id: true, title: true, category: true } } },
      orderBy: { completedAt: "desc" },
    });

    // 최근 6개월 리뷰 (평점 추이)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentReviews = await prisma.review.findMany({
      where: {
        targetId: profile.id,
        isVisible: true,
        createdAt: { gte: sixMonthsAgo },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        overallRating: true,
        content: true,
        createdAt: true,
      },
    });

    // 월별 평균 평점 계산
    const monthlyRatings: { month: string; avg: number }[] = [];
    const grouped: Record<string, number[]> = {};
    for (const r of recentReviews) {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r.overallRating);
    }
    for (const [month, ratings] of Object.entries(grouped)) {
      monthlyRatings.push({
        month,
        avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      });
    }

    // 추천사 (리뷰 중 높은 평점)
    const recommendations = await prisma.review.findMany({
      where: {
        targetId: profile.id,
        isVisible: true,
        overallRating: { gte: 4 },
      },
      take: 5,
      orderBy: { overallRating: "desc" },
      select: {
        id: true,
        content: true,
        overallRating: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      profile: {
        name: profile.user.name,
        profileImage: profile.user.profileImage,
        experienceYears: profile.experienceYears,
        totalCares: profile.totalCares,
        averageRating: profile.averageRating,
        totalReviews: profile.totalReviews,
        grade: profile.grade,
        region: profile.region,
        introduction: profile.introduction,
      },
      certificates: profile.certificates,
      completedEducations,
      monthlyRatings,
      recommendations,
    });
  } catch (err) {
    console.error("[GET /api/portfolio]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
