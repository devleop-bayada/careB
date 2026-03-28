import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const events = await prisma.emergencySOS.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
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
}
