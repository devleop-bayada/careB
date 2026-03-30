import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const { searchParams } = req.nextUrl;
    const caregiverId = searchParams.get("caregiverId");

    // caregiverId 쿼리 파라미터가 있으면 단건 북마크 여부 반환
    if (caregiverId) {
      const bookmark = await prisma.bookmark.findUnique({
        where: { userId_caregiverId: { userId, caregiverId } },
      });
      return NextResponse.json({ bookmarked: !!bookmark });
    }

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
  } catch (err) {
    console.error("[GET /api/bookmarks]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const { searchParams } = req.nextUrl;
    const caregiverId = searchParams.get("caregiverId");

    if (!caregiverId) {
      return NextResponse.json({ error: "요양보호사 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: { userId, caregiverId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/bookmarks]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error("[POST /api/bookmarks]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
