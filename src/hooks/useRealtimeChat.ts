"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  messageType: string;
  imageUrl: string | null;
  fileName: string | null;
  fileUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * Subscribe to real-time INSERT events on the InterviewMessage table
 * filtered by matchId. Calls onNewMessage when a new row is inserted.
 *
 * NOTE: Supabase Realtime must be enabled for the InterviewMessage table
 * in the Supabase Dashboard (Database -> Replication).
 */
export function useRealtimeChat(
  matchId: string | undefined,
  onNewMessage: (message: RealtimeMessage) => void
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!matchId) return;

    let channel: RealtimeChannel | null = null;

    try {
      channel = supabase
        .channel(`chat:${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "InterviewMessage",
            filter: `matchId=eq.${matchId}`,
          },
          (payload) => {
            callbackRef.current(payload.new as RealtimeMessage);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "InterviewMessage",
            filter: `matchId=eq.${matchId}`,
          },
          (payload) => {
            // Used for read receipt updates
            callbackRef.current(payload.new as RealtimeMessage);
          }
        )
        .subscribe();
    } catch (err) {
      console.error("[useRealtimeChat] subscription error:", err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId]);
}
