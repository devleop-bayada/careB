"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function PortfolioShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`w-full py-3.5 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
        copied
          ? "bg-green-500 text-white"
          : "bg-primary-500 text-white hover:bg-primary-600"
      }`}
    >
      {copied ? (
        <>
          <Check size={18} />
          링크가 복사되었습니다
        </>
      ) : (
        <>
          <Share2 size={18} />
          포트폴리오 공유하기
        </>
      )}
    </button>
  );
}
