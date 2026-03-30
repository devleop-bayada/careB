"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

interface MessageButtonProps {
  matchId: string | null;
  caregiverId: string;
}

export default function MessageButton({ matchId, caregiverId }: MessageButtonProps) {
  const router = useRouter();
  const toast = useToast();

  function handleClick() {
    if (matchId) {
      router.push(`/chat/${matchId}`);
    } else {
      toast.info("먼저 면접을 제안해주세요.");
      setTimeout(() => {
        router.push(`/matching/new?caregiverId=${caregiverId}`);
      }, 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 flex-1 py-3 border-2 border-primary-500 text-primary-500 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors"
    >
      <MessageSquare size={16} />
      메시지
    </button>
  );
}
