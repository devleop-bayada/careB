import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  Home, Droplets, Stethoscope, Brain, Sun, Hospital,
  Star, ShieldCheck, FileText, MapPin, Quote
} from "lucide-react";

const SERVICE_CATEGORIES = [
  { icon: Home, label: "방문요양", color: "bg-primary-50 text-primary-600" },
  { icon: Droplets, label: "방문목욕", color: "bg-blue-50 text-blue-500" },
  { icon: Stethoscope, label: "방문간호", color: "bg-pink-50 text-pink-500" },
  { icon: Sun, label: "주야간보호", color: "bg-yellow-50 text-yellow-600" },
  { icon: Hospital, label: "병원간병", color: "bg-red-50 text-red-500" },
  { icon: Brain, label: "치매전문", color: "bg-purple-50 text-purple-500" },
];

const STATS = [
  { value: "15,000+", label: "누적 요양보호사" },
  { value: "4.8/5.0", label: "보호자 만족도" },
  { value: "2시간", label: "평균 매칭 시간" },
];

const TESTIMONIALS = [
  {
    name: "김O자 보호자",
    text: "어머니 방문요양 서비스를 CareB에서 찾았어요. 꼼꼼한 검증 덕분에 안심하고 맡길 수 있었습니다.",
    rating: 5,
  },
  {
    name: "이O희 요양보호사",
    text: "체계적인 매칭 시스템 덕분에 제 경력에 맞는 일자리를 쉽게 찾을 수 있었어요.",
    rating: 5,
  },
  {
    name: "박O수 보호자",
    text: "실시간 돌봄일지로 아버지 상태를 매일 확인할 수 있어서 마음이 놓입니다.",
    rating: 5,
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-[600px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="CareB" className="w-8 h-8 rounded-xl" />
            <span className="text-primary-500 font-black text-xl tracking-tight">CareB</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 font-medium hover:text-gray-900">
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-primary-600 transition-colors"
            >
              시작하기
            </Link>
          </div>
        </header>


        {/* Hero Section */}
        <section className="relative mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-500 via-primary-400 to-primary-400 p-8 mt-2">
          <div className="relative z-10">
            <p className="text-primary-100 text-sm font-medium mb-2">어르신의 내일을, 믿음으로 잇다</p>
            <h1 className="text-white text-2xl font-black leading-tight mb-4">
              믿을 수 있는<br />어르신 요양 파트너
            </h1>
            <p className="text-primary-100 text-sm leading-relaxed mb-6">
              7단계 검증을 거친 요양보호사와<br />
              보호자를 연결해 드립니다.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-primary-500 font-bold text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              시작하기 →
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-4 top-16 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute right-8 -bottom-6 w-32 h-32 bg-primary-300/30 rounded-full" />
        </section>

        {/* Stats */}
        <section className="mx-4 mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-2">
                <p className="text-xl font-black text-primary-500">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Categories */}
        <section className="mx-4 mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">어떤 서비스가 필요하세요?</h2>
          <div className="grid grid-cols-3 gap-3">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href="/signup"
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${cat.color} hover:scale-105 transition-transform`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-semibold">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-4 mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">이용 방법</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "회원가입", desc: "보호자 또는 요양보호사로 간편하게 가입하세요" },
              { step: "02", title: "프로필 작성", desc: "상세한 프로필로 매칭 확률을 높이세요" },
              { step: "03", title: "매칭 시작", desc: "2시간 내 최적의 요양보호사/보호자를 찾아드려요" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4">
                <span className="text-2xl font-black text-primary-200">{item.step}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-4 mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">이용자 후기</h2>
          <div className="space-y-3">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-2 font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-4 mt-8 mb-12">
          <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-3xl p-6 text-center">
            <p className="text-white font-black text-lg mb-1">지금 바로 시작하세요!</p>
            <p className="text-primary-100 text-sm mb-4">무료로 가입하고 서비스를 이용해보세요</p>
            <Link
              href="/signup"
              className="inline-block bg-white text-primary-500 font-bold text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              무료 시작하기
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-5 py-6 text-center">
          <p className="text-xs text-gray-400">© 2025 CareB. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">이용약관</Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">개인정보처리방침</Link>
            <a href="mailto:support@bayada.kr" className="text-xs text-gray-400 hover:text-gray-600">고객센터</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
