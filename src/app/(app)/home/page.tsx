import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Search, MessageSquare, Calendar, Star, ChevronRight,
  HeartHandshake, Home, Shield, Sparkles,
  Droplets, Stethoscope, Sun, Clock, Timer, Hospital, Brain,
  ShieldCheck, FileText, MapPin, Wallet, AlertTriangle, UserCheck
} from "lucide-react";

async function getHomeData(userId: string, role: string) {
  if (role === "GUARDIAN") {
    const [guardianProfile, recentCaregivers, upcomingCares] = await Promise.all([
      prisma.guardianProfile.findUnique({ where: { userId } }),
      prisma.caregiverProfile.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { user: { select: { name: true, profileImage: true } } },
      }),
      prisma.careSession.findMany({
        where: {
          match: { guardian: { userId } },
          status: "SCHEDULED",
          scheduledDate: { gte: new Date() },
        },
        take: 3,
        orderBy: { scheduledDate: "asc" },
        include: {
          caregiver: { include: { user: { select: { name: true } } } },
        },
      }),
    ]);
    return { recentCaregivers, upcomingCares };
  } else {
    const [caregiverProfile, upcomingCares] = await Promise.all([
      prisma.caregiverProfile.findUnique({ where: { userId } }),
      prisma.careSession.findMany({
        where: {
          caregiver: { userId },
          status: "SCHEDULED",
          scheduledDate: { gte: new Date() },
        },
        take: 3,
        orderBy: { scheduledDate: "asc" },
        include: {
          match: { include: { guardian: { include: { user: { select: { name: true } } } } } },
        },
      }),
    ]);
    return { recentCaregivers: [], upcomingCares };
  }
}

const GUARDIAN_QUICK_ACTIONS = [
  { href: "/search/caregiver", icon: Search, label: "요양보호사 찾기", color: "bg-primary-50 text-primary-500" },
  { href: "/matching", icon: MessageSquare, label: "매칭 현황", color: "bg-blue-50 text-blue-500" },
  { href: "/care", icon: Calendar, label: "돌봄 관리", color: "bg-green-50 text-green-500" },
  { href: "/my/reviews", icon: Star, label: "내 리뷰", color: "bg-yellow-50 text-yellow-500" },
];

const CAREGIVER_QUICK_ACTIONS = [
  { href: "/search/guardian", icon: Search, label: "일자리 찾기", color: "bg-primary-50 text-primary-500" },
  { href: "/matching", icon: MessageSquare, label: "지원 현황", color: "bg-blue-50 text-blue-500" },
  { href: "/care", icon: Calendar, label: "돌봄 관리", color: "bg-green-50 text-green-500" },
  { href: "/my/certificates", icon: Shield, label: "자격 관리", color: "bg-purple-50 text-purple-500" },
];

const SERVICE_ICONS = [
  { icon: Home, label: "방문요양", desc: "신체활동·가사지원", href: "/search/caregiver?serviceCategory=HOME_CARE" },
  { icon: Droplets, label: "방문목욕", desc: "이동목욕 서비스", href: "/search/caregiver?serviceCategory=HOME_BATH" },
  { icon: Stethoscope, label: "방문간호", desc: "간호사 방문케어", href: "/search/caregiver?serviceCategory=HOME_NURSING" },
  { icon: Sun, label: "주야간보호", desc: "시설 통원 돌봄", href: "/search/caregiver?serviceCategory=DAY_NIGHT_CARE" },
  { icon: Clock, label: "단기보호", desc: "단기 시설 입소", href: "/search/caregiver?serviceCategory=SHORT_TERM_CARE" },
  { icon: Timer, label: "시간제돌봄", desc: "맞춤 시간제", href: "/search/caregiver?serviceCategory=HOURLY_CARE" },
  { icon: Hospital, label: "병원간병", desc: "24시간 간병", href: "/search/caregiver?serviceCategory=HOSPITAL_CARE" },
  { icon: Brain, label: "치매전문", desc: "치매 특화 돌봄", href: "/search/caregiver?serviceCategory=DEMENTIA_CARE" },
  { icon: HeartHandshake, label: "임종돌봄", desc: "호스피스 연계", href: "/search/caregiver?serviceCategory=HOSPICE_CARE" },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const isGuardian = user.role === "GUARDIAN";
  const quickActions = isGuardian ? GUARDIAN_QUICK_ACTIONS : CAREGIVER_QUICK_ACTIONS;

  const { recentCaregivers, upcomingCares } = await getHomeData(user.id, user.role);

  return (
    <div className="pb-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-5 pt-5 pb-8">
        <p className="text-primary-100 text-sm">안녕하세요</p>
        <h1 className="text-white text-xl font-black mt-0.5">
          {user.name}님<br />
          <span className="font-medium text-base">오늘도 좋은 하루 되세요!</span>
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-md p-4">
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="mx-4 mt-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-black text-sm">첫 요양 서비스 30% 할인!</p>
          <p className="text-blue-100 text-xs mt-0.5">이번 달 한정 특별 혜택</p>
        </div>
        <Link href="/my/pass" className="bg-white text-blue-500 text-xs font-bold px-3 py-1.5 rounded-full">
          자세히 보기
        </Link>
      </div>

      {/* Upcoming Care Sessions */}
      {upcomingCares.length > 0 && (
        <section className="mx-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">예정된 요양</h2>
            <Link href="/care" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingCares.map((cs: any) => {
              const otherName = isGuardian
                ? cs.caregiver?.user?.name
                : cs.match?.guardian?.user?.name;
              return (
                <Link key={cs.id} href={`/care/${cs.id}`}>
                  <div className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{otherName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(cs.scheduledDate).toLocaleDateString("ko-KR", {
                          month: "long", day: "numeric"
                        })} {cs.startTime}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-full">요양 예정</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Caregivers (Guardian only) */}
      {isGuardian && recentCaregivers.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-3 px-4">
            <h2 className="text-base font-bold text-gray-900">최근 등록 요양보호사</h2>
            <Link href="/search/caregiver" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {recentCaregivers.map((caregiver: any) => (
              <Link key={caregiver.id} href={`/caregiver/${caregiver.id}`} className="flex-shrink-0">
                <div className="w-28 bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {caregiver.user?.profileImage ? (
                      <img src={caregiver.user.profileImage} alt={caregiver.user.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary-500">{caregiver.user?.name?.[0]}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 text-center truncate">{caregiver.user?.name}</p>
                  <p className="text-xs text-gray-500 text-center mt-0.5 truncate">{caregiver.region}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">{caregiver.averageRating?.toFixed(1) ?? "신규"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Recommended Caregivers (Guardian only) */}
      {isGuardian && (
        <section className="mx-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary-500" />
              AI 추천 요양보호사
            </h2>
            <Link href="/search/caregiver" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">
              더보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCaregivers.slice(0, 3).map((caregiver: any, idx: number) => {
              const matchScore = [95, 91, 87][idx] || 80;
              return (
                <Link key={caregiver.id} href={`/caregiver/${caregiver.id}`}>
                  <div className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {caregiver.user?.profileImage ? (
                        <img src={caregiver.user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary-500">{caregiver.user?.name?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{caregiver.user?.name}</p>
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600">{caregiver.averageRating?.toFixed(1) ?? "신규"}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{caregiver.region}</p>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#0891b2"
                            strokeWidth="3"
                            strokeDasharray={`${matchScore}, 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary-500">
                          {matchScore}%
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-0.5">매칭률</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Service Categories */}
      <section className="mx-4 mt-5">
        <h2 className="text-base font-bold text-gray-900 mb-3">요양 서비스 종류</h2>
        <div className="grid grid-cols-3 gap-2">
          {SERVICE_ICONS.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-primary-500" />
                </div>
                <span className="text-xs font-medium text-gray-700">{s.label}</span>
                <span className="text-[10px] text-gray-400 -mt-1">{s.desc}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recommendation Cards */}
      <section className="mx-4 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">이런 분들에게 추천해요</h2>
        <div className="space-y-2">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">갑자기 간병이 필요할 때</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">입원 중인 가족의 간병인을 빠르게 찾아보세요</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home size={18} className="text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">재가요양 서비스가 필요할 때</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">장기요양등급을 받으신 어르신의 방문요양 서비스</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">치매 어르신 돌봄</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">치매 전문 교육을 이수한 요양보호사 매칭</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="mx-4 mt-6 mb-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">바야다가 특별한 이유</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center mb-2">
              <ShieldCheck size={18} className="text-primary-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">7단계 인증</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">자격증, 범죄경력, 건강진단까지 철저 검증</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-2">
              <FileText size={18} className="text-green-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">실시간 돌봄일지</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">어르신의 건강상태를 실시간으로 확인</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
              <MapPin size={18} className="text-blue-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">GPS 출퇴근 관리</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">정확한 돌봄 시간 자동 기록</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center mb-2">
              <Wallet size={18} className="text-yellow-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">안심 정산</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">3% 투명한 수수료, 에스크로 결제</p>
          </div>
        </div>
      </section>
    </div>
  );
}
