import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const region = searchParams.get("region");
    const careType = searchParams.get("careType");
    const caregiverType = searchParams.get("caregiverType");
    const specialty = searchParams.get("specialty");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const sortBy = searchParams.get("sortBy") ?? "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;

    const where: Record<string, unknown> = { user: { isActive: true, isBanned: false } };
    if (region) where.region = { contains: region };
    if (careType) where.serviceCategories = { contains: careType };
    if (caregiverType) where.caregiverType = caregiverType;
    if (specialty) where.serviceCategories = { contains: specialty };
    if (minRate) where.hourlyRate = { ...(where.hourlyRate as object ?? {}), gte: parseInt(minRate) };
    if (maxRate) where.hourlyRate = { ...(where.hourlyRate as object ?? {}), lte: parseInt(maxRate) };

    const orderBy: Record<string, string> =
      sortBy === "rate" ? { hourlyRate: "asc" }
      : sortBy === "reviews" ? { totalReviews: "desc" }
      : sortBy === "cares" ? { totalCares: "desc" }
      : { averageRating: "desc" };

    const [caregivers, total] = await Promise.all([
      prisma.caregiverProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
          availabilities: true,
          certificates: { where: { verificationStatus: "VERIFIED" } },
        },
      }),
      prisma.caregiverProfile.count({ where }),
    ]);

    const result = caregivers.map((s) => ({
      ...s,
      serviceCategories: JSON.parse(s.serviceCategories),
    }));

    return NextResponse.json({ caregivers: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/caregivers]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
