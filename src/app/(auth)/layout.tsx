"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-black">바</span>
            </div>
            <span className="text-primary-500 font-black text-xl tracking-tight">바야다</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
