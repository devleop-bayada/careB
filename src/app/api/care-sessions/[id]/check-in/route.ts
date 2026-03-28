import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const careSession = await prisma.careSession.findUnique({ where: { id: params.id } });
  if (!careSession) {
    return NextResponse.json({ error: "돌봄 세션을 찾을 수 없습니다." }, { status: 404 });
  }

  if (careSession.checkInTime) {
    return NextResponse.json({ error: "이미 체크인이 완료되었습니다." }, { status: 400 });
  }

  const body = await req.json();
  const { latitude, longitude, address } = body;

  if (latitude == null || longitude == null) {
    return NextResponse.json({ error: "위치 정보(위도, 경도)가 필요합니다." }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.careSession.update({
    where: { id: params.id },
    data: {
      checkInLat: latitude,
      checkInLng: longitude,
      checkInTime: now,
      checkInAddress: address ?? null,
      status: "IN_PROGRESS",
      actualStart: now,
    },
  });

  return NextResponse.json({ session: updated });
}
