import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  let matches;
  if (role === "GUARDIAN") {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return NextResponse.json({ rooms: [] });

    matches = await prisma.match.findMany({
      where: { guardianId: guardianProfile.id, status: { notIn: ["REJECTED", "CANCELLED"] } },
      orderBy: { updatedAt: "desc" },
      include: {
        caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } else {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return NextResponse.json({ rooms: [] });

    matches = await prisma.match.findMany({
      where: { caregiverId: caregiverProfile.id, status: { notIn: ["REJECTED", "CANCELLED"] } },
      orderBy: { updatedAt: "desc" },
      include: {
        guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  const rooms = matches.map((m) => ({
    id: m.id,
    status: m.status,
    lastMessage: m.messages[0] ?? null,
    updatedAt: m.updatedAt,
    ...(role === "GUARDIAN"
      ? { partner: (m as any).caregiver?.user }
      : { partner: (m as any).guardian?.user }),
  }));

  return NextResponse.json({ rooms });
}
