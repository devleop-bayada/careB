import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

export async function requireRole(role: string) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if ((session!.user as any).role !== role) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}
