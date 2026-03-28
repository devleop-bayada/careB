"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, ImagePlus, Paperclip, FileText, X } from "lucide-react";
import useSWR from "swr";
import BackHeader from "@/components/layout/BackHeader";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const matchId = params.id as string;

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR(`/api/chat/${matchId}`, fetcher, {
    refreshInterval: 3000,
  });

  const messages = data?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch match info separately for other party name
  const { data: matchData } = useSWR(`/api/matches/${matchId}`, fetcher);
  const match = matchData?.match;
  const isGuardian = currentUser?.role === "GUARDIAN";
  const otherUser = isGuardian
    ? match?.caregiver?.user
    : match?.guardian?.user;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachedImage(url);
    setShowAttach(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachedFile({ name: file.name, url });
    setShowAttach(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!message.trim() && !attachedImage && !attachedFile) || sending) return;
    setSending(true);
    try {
      const payload: any = { content: message };
      if (attachedImage) payload.imageUrl = attachedImage;
      if (attachedFile) payload.fileUrl = attachedFile.url;
      if (attachedFile) payload.fileName = attachedFile.name;

      await fetch(`/api/chat/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("");
      setAttachedImage(null);
      setAttachedFile(null);
      mutate();
    } finally {
      setSending(false);
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "calc(100vh - 4rem)" }}>
      <BackHeader title={otherUser?.name ?? "채팅"} fallbackHref="/chat" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            대화를 시작해보세요
          </div>
        )}
        {messages.map((msg: any) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 self-end overflow-hidden">
                  {otherUser?.profileImage ? (
                    <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{otherUser?.name?.[0]}</span>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                {msg.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-1 max-w-[200px]">
                    <img src={msg.imageUrl} alt="첨부 이미지" className="w-full h-auto object-cover rounded-2xl" />
                  </div>
                )}
                {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    download={msg.fileName || "파일"}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-xs font-medium ${
                      isMine ? "bg-primary-400 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FileText size={14} />
                    {msg.fileName || "파일 다운로드"}
                  </a>
                )}
                {msg.content && (
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-primary-500 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                )}
                <span className="text-[10px] text-gray-400 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Attachment Preview */}
      {(attachedImage || attachedFile) && (
        <div className="bg-white border-t border-gray-100 px-4 py-2">
          {attachedImage && (
            <div className="relative inline-block">
              <img src={attachedImage} alt="첨부" className="h-16 rounded-lg object-cover" />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          )}
          {attachedFile && (
            <div className="relative inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <FileText size={14} className="text-gray-500" />
              <span className="text-xs text-gray-700">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center ml-1"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        {/* Attachment Menu */}
        {showAttach && (
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
            >
              <ImagePlus size={20} className="text-primary-500" />
              <span className="text-[10px] text-primary-600 font-medium">사진</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Paperclip size={20} className="text-blue-500" />
              <span className="text-[10px] text-blue-600 font-medium">파일</span>
            </button>
          </div>
        )}
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttach(!showAttach)}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            type="submit"
            disabled={(!message.trim() && !attachedImage && !attachedFile) || sending}
            className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center disabled:bg-gray-200 transition-colors"
          >
            <Send size={15} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
