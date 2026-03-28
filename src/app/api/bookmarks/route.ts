import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      caregiver: {
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      },
    },
  });

  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const body = await req.json();
  const { caregiverId } = body;

  if (!caregiverId) {
    return NextResponse.json({ error: "요양보호사 ID가 필요합니다." }, { status: 400 });
  }

  const caregiver = await prisma.caregiverProfile.findUnique({ where: { id: caregiverId } });
  if (!caregiver) {
    return NextResponse.json({ error: "요양보호사를 찾을 수 없습니다." }, { status: 404 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_caregiverId: { userId, caregiverId } },
  });

  if (existing) {
    return NextResponse.json({ bookmark: existing, message: "이미 즐겨찾기에 추가되어 있습니다." });
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId, caregiverId },
    include: {
      caregiver: {
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      },
    },
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}
