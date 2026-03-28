import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createPostSchema } from "@/lib/validations/community";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") ?? "recent";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ];
    }

    const orderBy = sort === "popular"
      ? { viewCount: "desc" as const }
      : { createdAt: "desc" as const };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    const result = posts.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      _count: undefined,
    }));

    return NextResponse.json({
      posts: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET /api/community]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user as any;

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      images: JSON.stringify(parsed.data.images ?? []),
    },
  });

  return NextResponse.json({ post: { ...post, images: JSON.parse(post.images) } }, { status: 201 });
}
