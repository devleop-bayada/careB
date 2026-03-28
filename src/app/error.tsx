"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="text-xl font-black text-gray-900 mb-2">오류가 발생했어요</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        일시적인 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary-500 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-primary-600 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="border-2 border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
