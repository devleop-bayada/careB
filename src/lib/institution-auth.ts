import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";
import prisma from "./prisma";

/**
 * 기관 담당자 권한 확인 헬퍼
 * - INSTITUTION 역할이거나 InstitutionMember에 속한 사용자
 * - 기관 ID와 멤버 정보를 함께 반환
 */
export async function requireInstitutionAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      session: null,
      member: null,
      institutionId: null,
      error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const userId = (session.user as any).id as string;

  // InstitutionMember에서 소속 기관 찾기
  const member = await prisma.institutionMember.findFirst({
    where: { userId },
    include: { institution: true },
  });

  if (!member) {
    return {
      session,
      member: null,
      institutionId: null,
      error: NextResponse.json({ error: "기관 권한이 없습니다." }, { status: 403 }),
    };
  }

  return {
    session,
    member,
    institutionId: member.institutionId,
    error: null,
  };
}
