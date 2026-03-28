import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const postId = params.id;

  const post = await prisma.communityPost.findUnique({ where: { id: postId, isActive: true } });
  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    // Unlike
    await prisma.communityLike.delete({ where: { id: existing.id } });
    const likeCount = await prisma.communityLike.count({ where: { postId } });
    return NextResponse.json({ liked: false, likeCount });
  } else {
    // Like
    await prisma.communityLike.create({ data: { postId, userId } });
    const likeCount = await prisma.communityLike.count({ where: { postId } });
    return NextResponse.json({ liked: true, likeCount });
  }
}
