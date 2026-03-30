import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guardian = await prisma.guardianProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        careRecipients: true,
      },
    });

    if (!guardian) {
      return NextResponse.json({ error: "보호자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ guardian });
  } catch (err) {
    console.error("[GET /api/guardians/[id]]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
