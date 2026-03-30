"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Send, ImagePlus, Paperclip, FileText, X, Circle } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import { useRealtimeChat, type RealtimeMessage } from "@/hooks/useRealtimeChat";
import { usePresence } from "@/hooks/usePresence";
import { useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useMatch } from "@/hooks/useMatches";
import { useUpload } from "@/hooks/useUpload";

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
  const [attachedImageFile, setAttachedImageFile] = useState<File | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const [attachedFileRaw, setAttachedFileRaw] = useState<File | null>(null);
  const upload = useUpload();
  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages via React Query (3초 폴링으로 실시간 동기화)
  const { messages: initialMessages, isLoading } = useChatMessages(matchId);
  const [messages, setMessages] = useState<any[]>([]);

  // Sync React Query data into local state
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Fetch match info for other party name
  const { match } = useMatch(matchId);
  const isGuardian = currentUser?.role === "GUARDIAN";
  const otherUser = isGuardian
    ? match?.caregiver?.user
    : match?.guardian?.user;

  // --- Realtime: new messages ---
  const handleRealtimeMessage = useCallback(
    (payload: RealtimeMessage) => {
      setMessages((prev) => {
        // Check for duplicates (message might already exist from optimistic update)
        if (prev.some((m) => m.id === payload.id)) {
          // If it's an update (e.g. read receipt), replace the existing message
          return prev.map((m) => (m.id === payload.id ? { ...m, ...payload } : m));
        }
        return [...prev, payload];
      });
    },
    []
  );

  useRealtimeChat(matchId, handleRealtimeMessage);

  // --- Presence: online & typing ---
  const { onlineUsers, typingUsers, setTyping } = usePresence(matchId, currentUser?.id);
  const isOtherOnline = otherUser?.id ? onlineUsers.includes(otherUser.id) : false;
  const isOtherTyping = otherUser?.id ? typingUsers.includes(otherUser.id) : false;

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // Handle typing indicator
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachedImage(url);
    setAttachedImageFile(file);
    setShowAttach(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachedFile({ name: file.name, url });
    setAttachedFileRaw(file);
    setShowAttach(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!message.trim() && !attachedImage && !attachedFile) || sending) return;
    setSending(true);
    setTyping(false);

    try {
      const payload: any = { content: message };

      // Upload image via Supabase Storage
      if (attachedImageFile) {
        const { url } = await upload.mutateAsync(attachedImageFile);
        payload.imageUrl = url;
      }

      // Upload file via Supabase Storage
      if (attachedFileRaw && attachedFile) {
        const { url } = await upload.mutateAsync(attachedFileRaw);
        payload.fileUrl = url;
        payload.fileName = attachedFile.name;
      }

      const res = await fetch(`/api/chat/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { message: newMsg } = await res.json();
        // Optimistic: add immediately (realtime will deduplicate)
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      setMessage("");
      setAttachedImage(null);
      setAttachedImageFile(null);
      setAttachedFile(null);
      setAttachedFileRaw(null);
    } finally {
      setSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "100dvh" }}>
      <BackHeader
        title={
          <div className="flex items-center gap-2">
            <span>{otherUser?.name ?? "채팅"}</span>
            {isOtherOnline && (
              <Circle size={8} className="fill-green-500 text-green-500" />
            )}
          </div>
        }
        fallbackHref="/chat"
      />

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
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isMine && (
                    <span className={`text-[10px] ${msg.isRead ? "text-primary-500" : "text-gray-300"}`}>
                      {msg.isRead ? "읽음" : "전송됨"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 self-end overflow-hidden">
              {otherUser?.profileImage ? (
                <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-500">{otherUser?.name?.[0]}</span>
              )}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Attachment Preview */}
      {(attachedImage || attachedFile) && (
        <div className="bg-white border-t border-gray-100 px-4 py-2">
          {attachedImage && (
            <div className="relative inline-block">
              <img src={attachedImage} alt="첨부" className="h-16 rounded-lg object-cover" />
              <button
                onClick={() => { setAttachedImage(null); setAttachedImageFile(null); }}
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
                onClick={() => { setAttachedFile(null); setAttachedFileRaw(null); }}
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
            onChange={handleInputChange}
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
