"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  CreditCard,
  ShieldCheck,
  FileBarChart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/institution/dashboard", label: "대시보드", icon: <LayoutDashboard size={18} /> },
  { href: "/institution/staff", label: "인력관리", icon: <Users size={18} /> },
  { href: "/institution/recipients", label: "이용자관리", icon: <UserPlus size={18} /> },
  { href: "/institution/care-records", label: "돌봄기록", icon: <ClipboardList size={18} /> },
  { href: "/institution/claims", label: "급여청구", icon: <CreditCard size={18} /> },
  { href: "/institution/quality", label: "품질관리", icon: <ShieldCheck size={18} /> },
];

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [institutionName, setInstitutionName] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    const role = (session?.user as any)?.role;
    if (!session || (role !== "INSTITUTION" && role !== "ADMIN")) {
      router.replace("/home");
    }
  }, [session, status, router]);

  // 기관명 조회
  useEffect(() => {
    async function fetchInstitution() {
      try {
        const res = await fetch("/api/institution");
        if (res.ok) {
          const data = await res.json();
          if (data.institution?.name) setInstitutionName(data.institution.name);
        }
      } catch {}
    }
    if (session) fetchInstitution();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = (session?.user as any)?.role;
  if (!session || (role !== "INSTITUTION" && role !== "ADMIN")) return null;

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
          <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
            <Building2 size={14} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-900 font-black text-sm tracking-tight truncate">
              {institutionName || "기관관리"}
            </span>
          </div>
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
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={active ? "text-teal-500" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-teal-400" />}
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {session.user?.name?.[0] ?? "I"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-gray-400">기관 담당자</p>
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
            <span>기관</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {NAV_ITEMS.find((i) => pathname.startsWith(i.href))?.label ?? "기관관리"}
            </span>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
