import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caregiver = await prisma.caregiverProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, profileImage: true } },
      },
    });

    if (!caregiver) {
      return NextResponse.json({ error: "요양보호사를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ caregiver });
  } catch (err) {
    console.error("[GET /api/caregivers/[id]]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
