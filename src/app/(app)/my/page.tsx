import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User, Star, CreditCard, Baby, Shield, Calendar, DollarSign,
  Bell, HelpCircle, ChevronRight, LogOut, Heart, Users
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import MyPageSignOut from "./MyPageSignOut";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const isGuardian = user.role === "GUARDIAN";

  const parentMenuItems = [
    { href: "/my/profile", icon: User, label: "프로필 수정" },
    { href: "/my/reviews", icon: Star, label: "내 리뷰" },
    { href: "/my/bookmarks", icon: Heart, label: "즐겨찾기" },
    { href: "/my/pass", icon: CreditCard, label: "이용권 관리" },
    { href: "/my/care-recipients", icon: Baby, label: "어르신 관리" },
    { href: "/my/co-guardians", icon: Users, label: "공동보호자 관리" },
    { href: "/care", icon: Calendar, label: "돌봄 관리" },
    { href: "/care/settlement", icon: DollarSign, label: "정산 내역" },
    { href: "/my/settings", icon: Bell, label: "알림 설정" },
    { href: "#", icon: HelpCircle, label: "고객센터" },
  ];

  const sitterMenuItems = [
    { href: "/my/profile", icon: User, label: "프로필 수정" },
    { href: "/my/reviews", icon: Star, label: "받은 리뷰" },
    { href: "/my/certificates", icon: Shield, label: "자격 관리" },
    { href: "/care", icon: Calendar, label: "돌봄 관리" },
    { href: "/care/settlement", icon: DollarSign, label: "정산 내역" },
    { href: "/my/settings", icon: Bell, label: "알림 설정" },
    { href: "#", icon: HelpCircle, label: "고객센터" },
  ];

  const menuItems = isGuardian ? parentMenuItems : sitterMenuItems;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Profile Card */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.image} name={user.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-gray-900">{user.name}</h1>
              <Badge variant={isGuardian ? "primary" : "blue"} size="sm">
                {isGuardian ? "보호자 회원" : "요양보호사 회원"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user.phone}</p>
          </div>
          <Link href="/my/profile" className="text-xs text-primary-500 font-semibold">
            수정
          </Link>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mt-2 bg-white divide-y divide-gray-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-gray-600" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">{item.label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="mt-2 bg-white px-4 py-2">
        <MyPageSignOut />
      </div>

      {/* Customer Service */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <HelpCircle size={20} className="text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">CareB 고객센터</p>
            <p className="text-xs text-gray-500 mt-0.5">평일 09:00 ~ 18:00 (공휴일 제외)</p>
          </div>
          <a href="tel:1588-0000" className="text-sm font-bold text-primary-500">1588-0000</a>
        </div>
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-400">CareB v1.0.0</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">이용약관</Link>
          <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">개인정보처리방침</Link>
        </div>
        <Link href="#" className="block mt-3 text-xs text-red-400 hover:text-red-600">회원탈퇴</Link>
      </div>
    </div>
  );
}
