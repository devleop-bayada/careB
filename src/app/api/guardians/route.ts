import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const region = searchParams.get("region");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;

    const where: Record<string, unknown> = { user: { isActive: true, isBanned: false } };
    if (region) where.region = { contains: region };

    const [guardians, total] = await Promise.all([
      prisma.guardianProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
          careRecipients: true,
        },
      }),
      prisma.guardianProfile.count({ where }),
    ]);

    return NextResponse.json({ guardians, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/guardians]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
