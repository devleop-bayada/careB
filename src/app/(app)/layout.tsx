"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, MessageSquare, Users, User, Bell, AlertTriangle } from "lucide-react";

interface NavItem {
  href: string;
  guardianLabel: string;
  caregiverLabel: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    guardianLabel: "홈",
    caregiverLabel: "홈",
    icon: <Home size={22} />,
  },
  {
    href: "/search/caregiver",
    guardianLabel: "요양보호사찾기",
    caregiverLabel: "일자리찾기",
    icon: <Search size={22} />,
  },
  {
    href: "/community",
    guardianLabel: "커뮤니티",
    caregiverLabel: "커뮤니티",
    icon: <Users size={22} />,
  },
  {
    href: "/chat",
    guardianLabel: "채팅",
    caregiverLabel: "채팅",
    icon: <MessageSquare size={22} />,
  },
  {
    href: "/my",
    guardianLabel: "MY",
    caregiverLabel: "MY",
    icon: <User size={22} />,
  },
];

function FloatingSOSButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSOS() {
    setLoading(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);
        if (pos) {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      }
      await fetch("/api/emergency-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      setSent(true);
      setShowConfirm(false);
      setTimeout(() => setSent(false), 5000);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-bold">
        긴급 신고가 접수되었습니다
      </div>
    );
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900">긴급 신고</h3>
              <p className="text-sm text-gray-500 mt-1">긴급 상황을 신고하시겠습니까?</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm">취소</button>
              <button onClick={handleSOS} disabled={loading} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-60">{loading ? "전송 중..." : "긴급 신고"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isCaregiver = (session?.user as any)?.role === "CAREGIVER";

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[600px] relative flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
          <Link href="/home" className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">바</span>
            </div>
            <span className="text-primary-500 font-black text-lg tracking-tight">바야다</span>
          </Link>
          <Link href="/notifications" className="relative p-2 hover:bg-gray-50 rounded-full">
            <Bell size={22} className="text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-16">{children}</main>

        {/* Floating SOS for care pages */}
        {pathname.startsWith("/care/") && pathname !== "/care/settlement" && (
          <FloatingSOSButton />
        )}

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-40 bg-white border-t border-gray-100">
          <div className="flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const label = isCaregiver ? item.caregiverLabel : item.guardianLabel;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                    active ? "text-primary-500" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
