import { NextRequest, NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/recipients — 이용자 목록
export async function GET(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q") ?? undefined;

    const where: any = { institutionId: institutionId! };
    if (status) where.status = status;
    if (q) where.name = { contains: q, mode: "insensitive" };

    const recipients = await prisma.institutionRecipient.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // 담당자 이름 매핑
    const staffIds = Array.from(new Set(recipients.map((r) => r.assignedStaffId).filter(Boolean))) as string[];
    const staffMap: Record<string, string> = {};

    if (staffIds.length > 0) {
      const staffList = await prisma.institutionStaff.findMany({
        where: { id: { in: staffIds } },
        include: { caregiver: { select: { name: true } } },
      });
      staffList.forEach((s) => {
        staffMap[s.id] = s.caregiver.name;
      });
    }

    const recipientsWithStaff = recipients.map((r) => ({
      ...r,
      assignedStaffName: r.assignedStaffId ? staffMap[r.assignedStaffId] ?? null : null,
    }));

    return NextResponse.json({ recipients: recipientsWithStaff });
  } catch (err) {
    console.error("[GET /api/institution/recipients]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/institution/recipients — 이용자 등록
export async function POST(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const body = await req.json();
    const { name, birthDate, careLevel, careType, assignedStaffId } = body;

    if (!name || !birthDate || !careType) {
      return NextResponse.json({ error: "이름, 생년월일, 서비스 유형은 필수입니다." }, { status: 400 });
    }

    const recipient = await prisma.institutionRecipient.create({
      data: {
        institutionId: institutionId!,
        name,
        birthDate,
        careLevel: careLevel || null,
        careType,
        assignedStaffId: assignedStaffId || null,
      },
    });

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/institution/recipients]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
