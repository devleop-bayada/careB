"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ChatRoom {
  id: string;
  status: string;
  lastMessage: any;
  updatedAt: string;
  partner: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  unreadCount?: number;
}

export default function ChatPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const { data, refetch } = useQuery({
    queryKey: ["chatList"],
    queryFn: () => fetch("/api/chat").then((r) => r.json()),
    enabled: !!user,
  });

  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  // Sync query data into local state
  useEffect(() => {
    if (data?.rooms) {
      setRooms(data.rooms);
    }
  }, [data]);

  // Subscribe to all InterviewMessage inserts to update chat list in real-time
  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel | null = null;

    try {
      channel = supabase
        .channel("chat-list")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "InterviewMessage",
          },
          (payload) => {
            const newMsg = payload.new as any;

            setRooms((prev) => {
              const idx = prev.findIndex((r) => r.id === newMsg.matchId);
              if (idx === -1) {
                // Unknown match - refetch to get full data
                refetch();
                return prev;
              }

              const updated = [...prev];
              const room = { ...updated[idx] };
              room.lastMessage = newMsg;
              room.updatedAt = newMsg.createdAt;

              // Increment unread count if message is from the other user
              if (newMsg.senderId !== user.id) {
                room.unreadCount = (room.unreadCount || 0) + 1;
              }

              // Move to top
              updated.splice(idx, 1);
              updated.unshift(room);
              return updated;
            });
          }
        )
        .subscribe();
    } catch (err) {
      console.error("[ChatPage] realtime subscription error:", err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, refetch]);

  if (authStatus === "loading" || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const isGuardian = user.role === "GUARDIAN";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">채팅</h1>
      </div>

      {rooms.length === 0 && data ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">아직 대화가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1 text-center leading-relaxed">요양보호사와 매칭되면 채팅이 시작됩니다</p>
          <Link
            href={isGuardian ? "/search/caregiver" : "/search/guardian"}
            className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
          >
            {isGuardian ? "요양보호사 찾기" : "일자리 찾기"}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 bg-white">
          {rooms.map((room: ChatRoom) => {
            const other = room.partner;
            const lastMessage = room.lastMessage;
            const unread = room.unreadCount || 0;
            return (
              <Link key={room.id} href={`/chat/${room.id}`}>
                <div className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {other?.profileImage ? (
                      <img src={other.profileImage} alt={other.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-gray-500">{other?.name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{other?.name}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {lastMessage && (
                          <span className="text-xs text-gray-400">
                            {new Date(lastMessage.createdAt).toLocaleDateString("ko-KR", {
                              month: "short", day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      {lastMessage ? (
                        <p className="text-xs text-gray-500 truncate flex-1">{lastMessage.content}</p>
                      ) : (
                        <p className="text-xs text-gray-400">채팅을 시작해보세요</p>
                      )}
                      {unread > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
