"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationsClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAllRead() {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={markAllRead}
      disabled={loading}
      className="text-xs text-primary-500 font-semibold hover:text-primary-600 transition-colors disabled:opacity-60"
    >
      모두 읽음
    </button>
  );
}
