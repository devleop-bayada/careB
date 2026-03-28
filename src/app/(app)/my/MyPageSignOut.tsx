"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function MyPageSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center justify-between w-full py-4 hover:bg-gray-50 transition-colors rounded-xl px-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
          <LogOut size={16} className="text-red-500" />
        </div>
        <span className="text-sm font-medium text-red-500">로그아웃</span>
      </div>
    </button>
  );
}
