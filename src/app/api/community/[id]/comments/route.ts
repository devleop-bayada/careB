import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createCommentSchema } from "@/lib/validations/community";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.communityPost.findUnique({ where: { id: params.id, isActive: true } });
  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const comments = await prisma.communityComment.findMany({
    where: { postId: params.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  // Fetch author info for each comment
  const authorIds = Array.from(new Set(comments.map((c) => c.authorId)));
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, profileImage: true },
  });
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const result = comments.map((c) => ({
    ...c,
    author: authorMap.get(c.authorId) ?? null,
  }));

  return NextResponse.json({ comments: result });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  const post = await prisma.communityPost.findUnique({ where: { id: params.id, isActive: true } });
  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const comment = await prisma.communityComment.create({
    data: {
      postId: params.id,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  const author = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, profileImage: true },
  });

  return NextResponse.json({ comment: { ...comment, author } }, { status: 201 });
}
