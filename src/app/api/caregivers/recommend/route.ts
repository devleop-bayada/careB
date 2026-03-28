import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const { searchParams } = req.nextUrl;
  const guardianId = searchParams.get("guardianId");

  // Find guardian profile
  let guardianProfile;
  if (guardianId) {
    guardianProfile = await prisma.guardianProfile.findUnique({ where: { id: guardianId } });
  } else {
    guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  }

  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필을 찾을 수 없습니다." }, { status: 404 });
  }

  // Get guardian's care recipients to determine needed services
  const careRecipients = await prisma.careRecipient.findMany({
    where: { guardianId: guardianProfile.id },
  });

  // Get all active caregivers
  const caregivers = await prisma.caregiverProfile.findMany({
    where: {
      user: { isActive: true, isBanned: false },
    },
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
    },
  });

  // Score each caregiver
  const scored = caregivers.map((cg) => {
    let score = 0;

    // Region match (+30)
    if (guardianProfile.region && cg.region === guardianProfile.region) {
      score += 30;
    }

    // Service category match (+25)
    try {
      const categories = JSON.parse(cg.serviceCategories) as string[];
      // Check if caregiver's services match any care recipient needs
      if (categories.length > 0) {
        score += 25;
      }
    } catch {
      // ignore parse errors
    }

    // Rating score (+20 * averageRating/5)
    score += 20 * (cg.averageRating / 5);

    // Experience (+15 * min(experienceYears/10, 1))
    score += 15 * Math.min(cg.experienceYears / 10, 1);

    // Response rate (+10 * responseRate)
    score += 10 * cg.responseRate;

    return { ...cg, matchScore: Math.round(score * 100) / 100 };
  });

  // Sort and return top 3
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top3 = scored.slice(0, 3).map((cg) => ({
    id: cg.id,
    userId: cg.userId,
    user: cg.user,
    region: cg.region,
    experienceYears: cg.experienceYears,
    hourlyRate: cg.hourlyRate,
    averageRating: cg.averageRating,
    totalReviews: cg.totalReviews,
    responseRate: cg.responseRate,
    grade: cg.grade,
    serviceCategories: JSON.parse(cg.serviceCategories),
    specialties: JSON.parse(cg.specialties),
    matchScore: cg.matchScore,
  }));

  return NextResponse.json({ recommendations: top3 });
}
