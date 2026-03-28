"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-1">
            <img src="/icon.png" alt="CareB" className="w-12 h-12 rounded-2xl" />
            <span className="text-primary-500 font-black text-xl tracking-tight">CareB</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
