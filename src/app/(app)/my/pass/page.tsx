"use client";

import { useState } from "react";
import { CheckCircle, Crown, Zap } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import AlertDialog from "@/components/ui/AlertDialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PASS_OPTIONS = [
  {
    id: "7days",
    label: "7일권",
    price: 9900,
    originalPrice: 14900,
    days: 7,
    popular: false,
    benefits: ["요양보호사 프로필 무제한 열람", "메시지 무제한 발송", "우선 매칭 서비스"],
  },
  {
    id: "30days",
    label: "30일권",
    price: 29900,
    originalPrice: 44900,
    days: 30,
    popular: true,
    benefits: ["요양보호사 프로필 무제한 열람", "메시지 무제한 발송", "우선 매칭 서비스", "전문 컨설팅 1회"],
  },
  {
    id: "90days",
    label: "90일권",
    price: 69900,
    originalPrice: 134900,
    days: 90,
    popular: false,
    benefits: ["요양보호사 프로필 무제한 열람", "메시지 무제한 발송", "우선 매칭 서비스", "전문 컨설팅 3회", "전담 매니저 배정"],
  },
];

export default function PassPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  if (user !== undefined && user?.role !== "GUARDIAN") { router.push("/home"); return null; }
  const [selected, setSelected] = useState("30days");
  const [alertOpen, setAlertOpen] = useState(false);

  const selectedPass = PASS_OPTIONS.find((p) => p.id === selected);

  function handlePurchase() {
    setAlertOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <BackHeader title="이용권" fallbackHref="/my" />

      {/* Current Status */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={18} className="text-yellow-200" />
          <p className="text-sm font-bold">현재 이용권</p>
        </div>
        <p className="text-2xl font-black">미가입</p>
        <p className="text-primary-100 text-xs mt-1">이용권 구매 후 프리미엄 서비스를 이용하세요</p>
      </div>

      {/* Pass Options */}
      <div className="mx-4 mt-5">
        <h2 className="text-base font-bold text-gray-900 mb-3">이용권 선택</h2>
        <div className="space-y-3">
          {PASS_OPTIONS.map((pass) => (
            <button
              key={pass.id}
              onClick={() => setSelected(pass.id)}
              className={`w-full text-left border-2 rounded-2xl p-4 transition-all relative overflow-hidden ${
                selected === pass.id
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              {pass.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  인기
                </div>
              )}
              <div className="flex items-start justify-between pr-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-gray-900">{pass.label}</p>
                    {pass.popular && <Zap size={14} className="text-primary-500" />}
                  </div>
                  <p className="text-lg font-black text-primary-500 mt-1">
                    {pass.price.toLocaleString()}원
                    <span className="text-xs font-medium text-gray-400 line-through ml-2">
                      {pass.originalPrice.toLocaleString()}원
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    일 {Math.round(pass.price / pass.days).toLocaleString()}원
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                  selected === pass.id ? "border-primary-500 bg-primary-500" : "border-gray-300"
                }`}>
                  {selected === pass.id && <CheckCircle size={12} className="text-white" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      {selectedPass && (
        <div className="mx-4 mt-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">이용권 혜택</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
            {selectedPass.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5">
                <CheckCircle size={16} className="text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
        <button
          onClick={handlePurchase}
          className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl text-sm hover:bg-primary-600 transition-colors"
        >
          {selectedPass?.price.toLocaleString()}원 구매하기
        </button>
      </div>

      <AlertDialog
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="안내"
        message="결제 기능은 준비 중입니다."
      />
    </div>
  );
}
