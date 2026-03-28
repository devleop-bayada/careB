import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;

    const events = await prisma.emergencySOS.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/emergency-sos]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const body = await req.json();
    const { careSessionId, latitude, longitude, notes } = body;

    const sos = await prisma.emergencySOS.create({
      data: {
        userId,
        careSessionId: careSessionId ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        notes: notes ?? null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ sos }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/emergency-sos]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
