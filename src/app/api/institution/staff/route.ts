import { NextRequest, NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/staff — 소속 요양보호사 목록
export async function GET() {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const staffList = await prisma.institutionStaff.findMany({
      where: { institutionId: institutionId! },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            phone: true,
            caregiverProfile: {
              select: {
                licenseNumber: true,
                licenseVerified: true,
                averageRating: true,
                totalCares: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    // 각 요양보호사별 담당 이용자 수 집계
    const staffWithRecipientCount = await Promise.all(
      staffList.map(async (staff) => {
        const recipientCount = await prisma.institutionRecipient.count({
          where: {
            institutionId: institutionId!,
            assignedStaffId: staff.id,
            status: "ACTIVE",
          },
        });
        return { ...staff, recipientCount };
      })
    );

    return NextResponse.json({ staff: staffWithRecipientCount });
  } catch (err) {
    console.error("[GET /api/institution/staff]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/institution/staff — 요양보호사 등록
export async function POST(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const body = await req.json();
    const { caregiverPhone } = body;

    if (!caregiverPhone) {
      return NextResponse.json({ error: "요양보호사 연락처를 입력해주세요." }, { status: 400 });
    }

    // 전화번호로 사용자 검색
    const phone = caregiverPhone.replace(/-/g, "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json({ error: "등록되지 않은 사용자입니다." }, { status: 404 });
    }

    if (user.role !== "CAREGIVER") {
      return NextResponse.json({ error: "요양보호사 회원만 등록 가능합니다." }, { status: 400 });
    }

    // 이미 등록된 요양보호사인지 확인
    const existing = await prisma.institutionStaff.findUnique({
      where: { institutionId_caregiverId: { institutionId: institutionId!, caregiverId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "이미 등록된 요양보호사입니다." }, { status: 409 });
    }

    const staff = await prisma.institutionStaff.create({
      data: {
        institutionId: institutionId!,
        caregiverId: user.id,
      },
      include: {
        caregiver: { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({ staff }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/institution/staff]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
