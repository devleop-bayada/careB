import { NextRequest, NextResponse } from "next/server";
import { requireInstitutionAuth } from "@/lib/institution-auth";
import prisma from "@/lib/prisma";

// GET /api/institution/care-records — 돌봄 기록 통합 조회
export async function GET(req: NextRequest) {
  try {
    const { institutionId, error } = await requireInstitutionAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const recipientName = searchParams.get("recipientName");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    // 소속 요양보호사의 프로필 ID 조회
    const staffList = await prisma.institutionStaff.findMany({
      where: { institutionId: institutionId!, status: "ACTIVE" },
      select: { caregiverId: true },
    });
    const caregiverUserIds = staffList.map((s) => s.caregiverId);

    if (caregiverUserIds.length === 0) {
      return NextResponse.json({ records: [], total: 0, page, totalPages: 0 });
    }

    const profiles = await prisma.caregiverProfile.findMany({
      where: { userId: { in: caregiverUserIds } },
      select: { id: true, userId: true },
    });
    const profileIds = profiles.map((p) => p.id);

    if (profileIds.length === 0) {
      return NextResponse.json({ records: [], total: 0, page, totalPages: 0 });
    }

    // 케어세션 + 일지 조회
    const sessionWhere: any = {
      caregiverId: { in: profileIds },
    };

    if (dateFrom || dateTo) {
      sessionWhere.scheduledDate = {};
      if (dateFrom) sessionWhere.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) sessionWhere.scheduledDate.lte = new Date(dateTo + "T23:59:59");
    }

    const [sessions, total] = await Promise.all([
      prisma.careSession.findMany({
        where: sessionWhere,
        include: {
          caregiver: {
            include: { user: { select: { name: true } } },
          },
          recipients: {
            include: { careRecipient: { select: { name: true } } },
          },
          journals: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.careSession.count({ where: sessionWhere }),
    ]);

    // 이용자 이름 필터 (DB레벨 필터가 어렵기 때문에 어플리케이션 레벨)
    let filtered = sessions;
    if (recipientName) {
      filtered = sessions.filter((s) =>
        s.recipients.some((r) =>
          r.careRecipient.name.includes(recipientName)
        )
      );
    }

    const records = filtered.map((s) => ({
      id: s.id,
      scheduledDate: s.scheduledDate,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      caregiverName: s.caregiver.user.name,
      recipientNames: s.recipients.map((r) => r.careRecipient.name),
      totalHours: s.totalHours,
      journal: s.journals[0]
        ? {
            id: s.journals[0].id,
            title: s.journals[0].title,
            content: s.journals[0].content,
            mood: s.journals[0].mood,
            activities: s.journals[0].activities,
            createdAt: s.journals[0].createdAt,
          }
        : null,
    }));

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET /api/institution/care-records]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
