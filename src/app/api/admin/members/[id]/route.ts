import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/members/[id] — 회원 상세
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profileImage: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
      guardianProfile: {
        select: {
          id: true,
          region: true,
          address: true,
          introduction: true,
          relationship: true,
          matchesAsGuardian: {
            select: { id: true, status: true, createdAt: true, serviceCategory: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          reviewsWritten: {
            select: { id: true, overallRating: true, content: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      caregiverProfile: {
        select: {
          id: true,
          region: true,
          gender: true,
          experienceYears: true,
          hourlyRate: true,
          averageRating: true,
          totalReviews: true,
          totalCares: true,
          grade: true,
          matchesAsCaregiver: {
            select: { id: true, status: true, createdAt: true, serviceCategory: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          reviewsReceived: {
            select: { id: true, overallRating: true, content: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          settlements: {
            select: { id: true, amount: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      payments: {
        select: { id: true, amount: true, status: true, productType: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reportsMade: {
        select: { id: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reportsReceived: {
        select: { id: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PATCH /api/admin/members/[id] — 회원 상태 변경
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // "activate" | "ban" | "deactivate"

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
  }

  let updateData: any = {};
  if (action === "activate") {
    updateData = { isActive: true, isBanned: false };
  } else if (action === "ban") {
    updateData = { isBanned: true };
  } else if (action === "deactivate") {
    updateData = { isActive: false };
  } else {
    return NextResponse.json({ error: "잘못된 액션입니다." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, isActive: true, isBanned: true },
  });

  return NextResponse.json({ user: updated });
}
