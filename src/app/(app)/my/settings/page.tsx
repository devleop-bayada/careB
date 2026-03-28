"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import BackHeader from "@/components/layout/BackHeader";

const NOTIFICATION_SETTINGS = [
  { id: "match", label: "매칭 알림", desc: "새로운 매칭 요청 및 결과" },
  { id: "message", label: "메시지 알림", desc: "새 채팅 메시지" },
  { id: "review", label: "리뷰 알림", desc: "새 리뷰 등록" },
  { id: "care", label: "돌봄 알림", desc: "돌봄 시작/종료 알림" },
  { id: "marketing", label: "마케팅 알림", desc: "이벤트 및 혜택 정보" },
  { id: "community", label: "커뮤니티 알림", desc: "댓글 및 좋아요 알림" },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    match: true,
    message: true,
    review: true,
    care: true,
    marketing: false,
    community: true,
  });

  function toggle(id: string) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="설정" fallbackHref="/my" />

      {/* Notifications */}
      <div className="mt-4">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">알림 설정</p>
        <div className="bg-white divide-y divide-gray-50">
          {NOTIFICATION_SETTINGS.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notifications[item.id] ? "bg-primary-500" : "bg-gray-200"
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  notifications[item.id] ? "translate-x-5.5 left-5" : "left-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="mt-4">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">계정</p>
        <div className="bg-white divide-y divide-gray-50">
          {[
            { label: "비밀번호 변경", href: "#" },
            { label: "연결된 소셜 계정", href: "#" },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">정보</p>
        <div className="bg-white divide-y divide-gray-50">
          {[
            { label: "서비스 이용약관", href: "#" },
            { label: "개인정보처리방침", href: "#" },
            { label: "오픈소스 라이선스", href: "#" },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm font-medium text-gray-900">앱 버전</span>
            <span className="text-sm text-gray-400">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Customer Service */}
      <div className="mt-4">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">고객센터</p>
        <div className="bg-white divide-y divide-gray-50">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm font-medium text-gray-900">바야다 고객센터</span>
            <a href="tel:1588-0000" className="text-sm font-bold text-primary-500">1588-0000</a>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">평일 09:00 ~ 18:00 (공휴일 제외)</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-4 mb-8">
        <div className="bg-white">
          <Link href="#">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-red-500">회원탈퇴</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
