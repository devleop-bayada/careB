"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
