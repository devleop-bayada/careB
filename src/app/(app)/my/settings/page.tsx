"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronRight, X } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const NOTIFICATION_SETTINGS = [
  { id: "match", label: "매칭 알림", desc: "새로운 매칭 요청 및 결과" },
  { id: "message", label: "메시지 알림", desc: "새 채팅 메시지" },
  { id: "review", label: "리뷰 알림", desc: "새 리뷰 등록" },
  { id: "care", label: "돌봄 알림", desc: "돌봄 시작/종료 알림" },
  { id: "marketing", label: "마케팅 알림", desc: "이벤트 및 혜택 정보" },
  { id: "community", label: "커뮤니티 알림", desc: "댓글 및 좋아요 알림" },
];

export default function SettingsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    match: true,
    message: true,
    review: true,
    care: true,
    marketing: false,
    community: true,
  });

  const [toast, setToast] = useState<string | null>(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function toggle(id: string) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handlePlaceholder() {
    showToast("준비 중인 기능입니다");
  }

  async function handlePasswordChange() {
    setPwError(null);

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("모든 항목을 입력해주세요.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "비밀번호 변경에 실패했습니다.");
        return;
      }
      setShowPasswordModal(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("비밀번호가 변경되었습니다");
    } catch {
      setPwError("서버 오류가 발생했습니다.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (res.ok) {
        await signOut({ redirect: false });
        router.push("/");
      } else {
        showToast("회원탈퇴에 실패했습니다");
      }
    } catch {
      showToast("서버 오류가 발생했습니다");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="설정" fallbackHref="/my" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

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
          <button onClick={() => setShowPasswordModal(true)} className="w-full">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-gray-900">비밀번호 변경</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>
          <button onClick={handlePlaceholder} className="w-full">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-gray-900">연결된 소셜 계정</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">정보</p>
        <div className="bg-white divide-y divide-gray-50">
          {[
            { label: "서비스 이용약관", href: "/terms" },
            { label: "개인정보처리방침", href: "/privacy" },
            { label: "오픈소스 라이선스", href: null },
          ].map((item) => (
            <button key={item.label} onClick={item.href ? () => router.push(item.href!) : handlePlaceholder} className="w-full">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
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
            <span className="text-sm font-medium text-gray-900">CareB 고객센터</span>
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
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-red-500">회원탈퇴</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[600px] px-5 py-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">비밀번호 변경</h2>
              <button onClick={() => { setShowPasswordModal(false); setPwError(null); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {pwError && (
              <div className="mb-4 bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                {pwError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">현재 비밀번호</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호 입력"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">새 비밀번호</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="새 비밀번호 입력 (6자 이상)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60 mt-2"
              >
                {pwLoading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="회원탈퇴"
        message={"정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다."}
        confirmText="탈퇴"
        cancelText="취소"
        variant="danger"
      />
    </div>
  );
}
