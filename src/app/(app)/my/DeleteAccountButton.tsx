"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDeleteAccount() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (res.ok) {
        await signOut({ redirect: false });
        router.push("/login");
      }
    } catch {
      // 실패 시 다이얼로그만 닫음
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="block w-full text-center mt-3 text-xs text-red-400 hover:text-red-600"
      >
        회원탈퇴
      </button>
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="회원탈퇴"
        message={"정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다."}
        confirmText={loading ? "처리 중..." : "탈퇴"}
        cancelText="취소"
        variant="danger"
      />
    </>
  );
}
