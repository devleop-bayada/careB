import Link from "next/link";
import { MessageSquare, Heart, PenSquare, Search, Eye, ArrowUpDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import CommunityTabs from "./CommunityTabs";
import CommunitySearch from "./CommunitySearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  PARENTING: "돌봄이야기",
  EDUCATION: "요양정보",
  SITTER: "요양보호사이야기",
  QNA: "질문/상담",
  POLICY: "제도안내",
  HEALTH: "건강정보",
};

async function getPosts(category: string, q?: string, sort?: string) {
  const params = new URLSearchParams();
  if (category && category !== "ALL") params.set("category", category);
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  const qs = params.toString() ? `?${params.toString()}` : "";
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/community${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const category = searchParams.category || "ALL";
  const q = searchParams.q || "";
  const sort = searchParams.sort || "latest";
  const posts = await getPosts(category, q, sort);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-0 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">커뮤니티</h1>
        <CommunitySearch initialQuery={q} initialSort={sort} />
        <CommunityTabs activeCategory={category} role={userRole} />
      </div>

      {/* Posts */}
      <div className="px-4 py-3 space-y-2">
        {posts.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={40} />}
            title="아직 게시글이 없어요"
            description="첫 글을 작성해보세요!"
          />
        ) : (
          posts.map((post: any) => (
            <Link key={post.id} href={`/community/${post.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" size="sm">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </Badge>
                </div>
                <h2 className="text-sm font-bold text-gray-900 line-clamp-2">{post.title}</h2>
                {post.content && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{post.content}</p>
                )}
                {post.images && post.images.length > 0 && (
                  <div className="mt-2 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{post.authorName || "익명"}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{post.comments?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{post.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Floating Write Button */}
      <Link
        href="/community/write"
        className="fixed bottom-24 right-4 w-12 h-12 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors z-30"
      >
        <PenSquare size={20} />
      </Link>
    </div>
  );
}
