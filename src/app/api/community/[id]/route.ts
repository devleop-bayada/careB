import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { updatePostSchema } from "@/lib/validations/community";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.communityPost.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      _count: { select: { likes: true, comments: true } },
      comments: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  // Increment viewCount
  await prisma.communityPost.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  // Look up author info
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
    select: { id: true, name: true, profileImage: true },
  });

  return NextResponse.json({
    post: {
      ...post,
      images: JSON.parse(post.images),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      author,
      viewCount: post.viewCount + 1,
      _count: undefined,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  const post = await prisma.communityPost.findUnique({ where: { id: params.id } });
  if (!post || !post.isActive) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.content !== undefined) data.content = parsed.data.content;
  if (parsed.data.category !== undefined) data.category = parsed.data.category;
  if (parsed.data.images !== undefined) data.images = JSON.stringify(parsed.data.images);

  const updated = await prisma.communityPost.update({ where: { id: params.id }, data });
  return NextResponse.json({ post: { ...updated, images: JSON.parse(updated.images) } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  const post = await prisma.communityPost.findUnique({ where: { id: params.id } });
  if (!post || !post.isActive) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await prisma.communityPost.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
