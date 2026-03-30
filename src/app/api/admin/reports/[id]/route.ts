import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "OPERATOR";
}

// GET /api/admin/reports/[id] — 신고 상세
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, email: true, phone: true, role: true } },
      target: { select: { id: true, name: true, email: true, phone: true, role: true, isBanned: true, isActive: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
  }

  // 대상자의 이전 신고 이력
  const previousReports = await prisma.report.findMany({
    where: { targetId: report.targetId, id: { not: id } },
    select: { id: true, type: true, status: true, reason: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ report, previousReports });
}

// PATCH /api/admin/reports/[id] — 신고 상태 변경 + 처리
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !requireAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, resolution, targetAction } = body;
  // status: "INVESTIGATING" | "RESOLVED" | "DISMISSED"
  // targetAction?: "warn" | "ban" | "deactivate" (RESOLVED 시)

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
  }

  const updateData: any = { status };
  if (status === "RESOLVED" || status === "DISMISSED") {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = (session.user as any).id;
    if (resolution) updateData.resolution = resolution;
  }

  const updated = await prisma.report.update({
    where: { id },
    data: updateData,
  });

  // 대상자 제재 처리
  if (status === "RESOLVED" && targetAction) {
    const targetUpdate: any = {};
    if (targetAction === "ban") {
      targetUpdate.isBanned = true;
    } else if (targetAction === "deactivate") {
      targetUpdate.isActive = false;
    }
    // "warn" 은 별도 조치 없이 resolution에 기록만
    if (Object.keys(targetUpdate).length > 0) {
      await prisma.user.update({
        where: { id: report.targetId },
        data: targetUpdate,
      });
    }
  }

  return NextResponse.json({ report: updated });
}
