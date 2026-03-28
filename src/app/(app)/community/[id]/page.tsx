import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Heart, Bookmark, MessageSquare, Eye } from "lucide-react";
import CommunityDetailClient from "./CommunityDetailClient";
import CommunityLikeButton from "./CommunityLikeButton";
import BackHeader from "@/components/layout/BackHeader";

const CATEGORY_LABELS: Record<string, string> = {
  PARENTING: "돌봄이야기",
  EDUCATION: "요양정보",
  SITTER: "요양보호사이야기",
  QNA: "질문/상담",
  POLICY: "제도안내",
  HEALTH: "건강정보",
};

async function getPost(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/community/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
  } catch {
    return null;
  }
}

export default async function CommunityDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;

  const post = await getPost(params.id);
  if (!post) notFound();

  const comments: any[] = post.comments || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="게시글" fallbackHref="/community" />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Post */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-primary-100 text-primary-600 font-semibold px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          </div>

          <h1 className="text-lg font-black text-gray-900 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-2 mt-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-xs font-bold text-gray-500">{post.authorName?.[0] || "익"}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">{post.authorName || "익명"}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="py-5">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {post.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Like / Bookmark / View Count */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
            <CommunityLikeButton postId={params.id} initialLikes={post.likes || 0} />
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary-500 transition-colors">
              <Bookmark size={18} />
              <span className="text-sm font-medium">저장</span>
            </button>
            <div className="flex items-center gap-3 text-gray-400 ml-auto">
              <div className="flex items-center gap-1.5">
                <Eye size={16} />
                <span className="text-sm">{post.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare size={16} />
                <span className="text-sm">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          <h2 className="text-sm font-bold text-gray-900 mb-4">댓글 {comments.length}개</h2>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">첫 댓글을 작성해보세요!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">{comment.authorName?.[0] || "익"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900">{comment.authorName || "익명"}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <CommunityDetailClient postId={params.id} currentUserId={currentUser?.id} />
    </div>
  );
}
