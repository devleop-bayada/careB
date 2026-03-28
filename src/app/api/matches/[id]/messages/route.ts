import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const messages = await prisma.interviewMessage.findMany({
    where: { matchId: params.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, profileImage: true } } },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const body = await req.json();
  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) {
    return NextResponse.json({ error: "매칭 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const message = await prisma.interviewMessage.create({
    data: {
      matchId: params.id,
      senderId: userId,
      content,
      imageUrl: body.imageUrl ?? null,
    },
    include: { sender: { select: { id: true, name: true, profileImage: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
