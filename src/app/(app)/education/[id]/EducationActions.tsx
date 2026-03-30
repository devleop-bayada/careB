"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EducationActionsProps {
  educationId: string;
  enrollment: { id: string; progress: number; isCompleted: boolean } | null;
}

export default function EducationActions({ educationId, enrollment }: EducationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    try {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ educationId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // 오류 무시
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/education/${educationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // 오류 무시
    } finally {
      setLoading(false);
    }
  }

  if (!enrollment) {
    return (
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
      >
        {loading ? "처리 중..." : "수강 신청"}
      </button>
    );
  }

  if (enrollment.isCompleted) {
    return (
      <button
        disabled
        className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl text-sm cursor-default"
      >
        수료 완료
      </button>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
    >
      {loading ? "처리 중..." : "수료 완료하기"}
    </button>
  );
}
