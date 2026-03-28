"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  userId: string;
  isTyping: boolean;
  onlineAt: string;
}

interface UsePresenceReturn {
  onlineUsers: string[];
  typingUsers: string[];
  setTyping: (isTyping: boolean) => void;
}

/**
 * Track online presence and typing indicators for a chat room.
 * Uses Supabase Realtime Presence (no database table required).
 */
export function usePresence(
  matchId: string | undefined,
  userId: string | undefined
): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!matchId || !userId) return;

    try {
      const channel = supabase.channel(`presence:${matchId}`, {
        config: { presence: { key: userId } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<PresenceState>();
          const online: string[] = [];
          const typing: string[] = [];

          Object.values(state).forEach((presences) => {
            presences.forEach((p) => {
              if (p.userId && p.userId !== userId) {
                online.push(p.userId);
                if (p.isTyping) {
                  typing.push(p.userId);
                }
              }
            });
          });

          setOnlineUsers(online);
          setTypingUsers(typing);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              userId,
              isTyping: false,
              onlineAt: new Date().toISOString(),
            });
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error("[usePresence] subscription error:", err);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [matchId, userId]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !userId) return;

      channelRef.current.track({
        userId,
        isTyping,
        onlineAt: new Date().toISOString(),
      });

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (channelRef.current) {
            channelRef.current.track({
              userId,
              isTyping: false,
              onlineAt: new Date().toISOString(),
            });
          }
        }, 3000);
      }
    },
    [userId]
  );

  return { onlineUsers, typingUsers, setTyping };
}
