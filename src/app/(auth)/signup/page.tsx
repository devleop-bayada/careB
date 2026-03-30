import Link from "next/link";
import { HeartHandshake, Briefcase } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

export default function SignupPage() {
  return (
    <div className="w-full">
      <BackHeader title="회원가입" fallbackHref="/" />
      <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900 text-center mb-2">회원가입</h1>
      <p className="text-sm text-gray-500 text-center mb-8">어떤 회원으로 가입하시겠어요?</p>

      <div className="space-y-4">
        {/* Guardian Card */}
        <Link href="/signup/guardian" className="block">
          <div className="border-2 border-gray-100 hover:border-primary-400 rounded-2xl p-6 transition-all hover:shadow-md group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <HeartHandshake size={28} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-bold text-gray-900">보호자 회원</h2>
                  <span className="text-xs bg-primary-100 text-primary-600 font-semibold px-2 py-0.5 rounded-full">추천</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  어르신을 위한 믿을 수 있는 돌봄 서비스를 찾아보세요
                </p>
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-xs text-primary-500 font-semibold">요양보호사를 찾고 있어요 →</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Caregiver Card */}
        <Link href="/signup/caregiver" className="block">
          <div className="border-2 border-gray-100 hover:border-primary-400 rounded-2xl p-6 transition-all hover:shadow-md group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Briefcase size={28} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 mb-1">요양보호사 회원</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  내 경력과 전문성에 맞는 돌봄 일자리를 찾아보세요
                </p>
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-xs text-blue-500 font-semibold">일자리를 찾고 있어요 →</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        이미 회원이신가요?{" "}
        <Link href="/login" className="text-primary-500 font-semibold hover:underline">
          로그인
        </Link>
      </p>
      </div>
    </div>
  );
}
