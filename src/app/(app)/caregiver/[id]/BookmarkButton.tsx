"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function BookmarkButton({ caregiverId }: { caregiverId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/bookmarks?caregiverId=${caregiverId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.bookmarked) setBookmarked(true);
      })
      .catch(() => {});
  }, [caregiverId]);

  async function toggleBookmark() {
    if (loading) return;
    setLoading(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks?caregiverId=${caregiverId}`, { method: "DELETE" });
        setBookmarked(false);
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caregiverId }),
        });
        setBookmarked(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-60"
      aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
    >
      <Heart
        size={20}
        className={bookmarked ? "text-red-500 fill-red-500" : "text-gray-300"}
      />
    </button>
  );
}
