"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function CommunityDetailClient({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      setComment("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={currentUserId ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있어요"}
          disabled={!currentUserId || loading}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!comment.trim() || loading || !currentUserId}
          className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center disabled:bg-gray-200 transition-colors"
        >
          <Send size={15} className="text-white" />
        </button>
      </form>
    </div>
  );
}
