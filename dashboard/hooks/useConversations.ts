"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "@/types";

export function useConversationMessages(phone: string, triggerRefetch?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);

  // Tracks last processed triggerRefetch value to avoid duplicate fetches
  const prevTriggerRef = useRef<string | null | undefined>(undefined);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(100);
    setMessages(((data as Message[]) || []).reverse());
  }, [phone]);

  // Mount / phone-change: initial fetch + Realtime subscription (fast path)
  useEffect(() => {
    if (!phone) return;

    prevTriggerRef.current = undefined; // reset when switching conversations

    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    const channel = supabase
      .channel(`chat-${phone}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `phone=eq.${phone}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as Message]); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [phone, fetchMessages]);

  // Reliable fallback: re-fetch when conversations.last_message_at changes.
  // The DB trigger fn_upsert_conversation_on_message updates conversations on
  // every messages INSERT, so conversations Realtime fires whenever a message
  // arrives — even if messages table Realtime is slow or drops.
  useEffect(() => {
    if (!phone || !triggerRefetch) return;
    if (triggerRefetch === prevTriggerRef.current) return;
    prevTriggerRef.current = triggerRefetch;
    fetchMessages();
  }, [phone, triggerRefetch, fetchMessages]);

  return { messages, loading };
}
