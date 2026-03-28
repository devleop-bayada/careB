import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ coGuardians: [] });
  }

  const coGuardians = await prisma.coGuardian.findMany({
    where: {
      OR: [
        { ownerId: guardianProfile.id },
        { memberId: guardianProfile.id },
      ],
    },
    include: {
      owner: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
      member: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
    },
  });

  return NextResponse.json({ coGuardians });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const { phone, permission } = body;

  if (!phone) {
    return NextResponse.json({ error: "전화번호가 필요합니다." }, { status: 400 });
  }

  // Find user by phone
  const normalizedPhone = phone.replace(/-/g, "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
  const targetUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (!targetUser) {
    return NextResponse.json({ error: "해당 전화번호의 사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const targetProfile = await prisma.guardianProfile.findUnique({ where: { userId: targetUser.id } });
  if (!targetProfile) {
    return NextResponse.json({ error: "해당 사용자의 보호자 프로필이 없습니다." }, { status: 404 });
  }

  if (targetProfile.id === guardianProfile.id) {
    return NextResponse.json({ error: "자기 자신을 공동보호자로 추가할 수 없습니다." }, { status: 400 });
  }

  // Check for existing
  const existing = await prisma.coGuardian.findUnique({
    where: { ownerId_memberId: { ownerId: guardianProfile.id, memberId: targetProfile.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "이미 공동보호자로 등록되어 있습니다." }, { status: 409 });
  }

  const coGuardian = await prisma.coGuardian.create({
    data: {
      ownerId: guardianProfile.id,
      memberId: targetProfile.id,
      permission: permission ?? "READ",
      inviteEmail: phone,
      status: "PENDING",
    },
    include: {
      owner: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
      member: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
    },
  });

  return NextResponse.json({ coGuardian }, { status: 201 });
}
