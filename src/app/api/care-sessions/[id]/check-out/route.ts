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

  if (!careSession.checkInTime) {
    return NextResponse.json({ error: "체크인을 먼저 완료해주세요." }, { status: 400 });
  }

  if (careSession.checkOutTime) {
    return NextResponse.json({ error: "이미 체크아웃이 완료되었습니다." }, { status: 400 });
  }

  const body = await req.json();
  const { latitude, longitude } = body;

  if (latitude == null || longitude == null) {
    return NextResponse.json({ error: "위치 정보(위도, 경도)가 필요합니다." }, { status: 400 });
  }

  const now = new Date();
  const totalHours = (now.getTime() - careSession.checkInTime.getTime()) / (1000 * 60 * 60);
  const roundedHours = Math.round(totalHours * 100) / 100;
  const totalAmount = Math.round(roundedHours * careSession.hourlyRate);

  const updated = await prisma.careSession.update({
    where: { id: params.id },
    data: {
      checkOutLat: latitude,
      checkOutLng: longitude,
      checkOutTime: now,
      actualEnd: now,
      totalHours: roundedHours,
      totalAmount,
      status: "COMPLETED",
    },
  });

  return NextResponse.json({ session: updated });
}
