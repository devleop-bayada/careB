"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function CommunityLikeButton({
  postId,
  initialLikes,
}: {
  postId: string;
  initialLikes: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
      });
      if (res.ok) {
        if (liked) {
          setLikes((prev) => Math.max(0, prev - 1));
        } else {
          setLikes((prev) => prev + 1);
        }
        setLiked(!liked);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
        liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      }`}
    >
      <Heart size={18} className={liked ? "fill-red-500" : ""} />
      <span className="text-sm font-medium">{likes}</span>
    </button>
  );
}
