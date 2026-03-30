"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  GitMerge,
  CreditCard,
  AlertTriangle,
  FileText,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "대시보드", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/members", label: "회원관리", icon: <Users size={18} /> },
  { href: "/admin/matching", label: "매칭", icon: <GitMerge size={18} /> },
  { href: "/admin/payments", label: "결제/정산", icon: <CreditCard size={18} /> },
  { href: "/admin/reports", label: "신고/분쟁", icon: <AlertTriangle size={18} /> },
  { href: "/admin/content/notices", label: "콘텐츠", icon: <FileText size={18} /> },
  { href: "/admin/analytics", label: "분석", icon: <BarChart2 size={18} /> },
];

// URL 매핑: (admin) 라우트 그룹은 URL에서 제거됨
// /dashboard → src/app/(admin)/dashboard/page.tsx
// /admin/content/notices → src/app/(admin)/admin/content/notices/page.tsx
// /admin/analytics → src/app/(admin)/admin/analytics/page.tsx

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "OPERATOR")) {
      router.replace("/home");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = (session?.user as any)?.role;
  if (!session || (role !== "ADMIN" && role !== "OPERATOR")) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside
        className={`${
          sidebarOpen ? "w-56" : "w-0 overflow-hidden"
        } flex-shrink-0 transition-all duration-200 bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* 로고 */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">C</span>
          </div>
          <span className="text-gray-900 font-black text-base tracking-tight">CareB 관리자</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={active ? "text-primary-500" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {session.user?.name?.[0] ?? "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-gray-400">{role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 상단 헤더 */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>관리자</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {NAV_ITEMS.find((i) => pathname.startsWith(i.href))?.label ?? "백오피스"}
            </span>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
