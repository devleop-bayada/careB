"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackHeaderProps {
  title: React.ReactNode;
  fallbackHref?: string;
}

export default function BackHeader({ title, fallbackHref }: BackHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-center h-12 px-2 relative">
      <button onClick={handleBack} className="absolute left-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      <h1 className="text-base font-bold text-gray-900">{title}</h1>
    </div>
  );
}
