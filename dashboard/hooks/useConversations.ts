"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Conversation, Message, Pedido } from "@/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const { data: messages } = await supabase
      .from("messages")
      .select("phone, role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (!messages) return;

    const byPhone = new Map<string, Message & { phone: string }>();
    for (const msg of messages as (Message & { phone: string })[]) {
      if (!byPhone.has(msg.phone)) byPhone.set(msg.phone, msg);
    }

    const phones = [...byPhone.keys()];
    if (!phones.length) { setLoading(false); return; }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: pedidos }, { data: handoffs }] = await Promise.all([
      supabase
        .from("pedidos")
        .select("id, cell, client, state, total, delivery_type, items")
        .in("cell", phones)
        .in("state", ["pending", "confirmed", "preparing", "ready"])
        .order("created_at", { ascending: false }),
      supabase
        .from("handoffs")
        .select("cell")
        .in("cell", phones)
        .gte("created_at", since24h),
    ]);

    const handoffSet = new Set((handoffs || []).map((h) => h.cell));
    const pedidoMap = new Map<string, Pedido>();
    for (const p of (pedidos as Pedido[]) || []) {
      if (!pedidoMap.has(p.cell)) pedidoMap.set(p.cell, p);
    }

    const convs: Conversation[] = [...byPhone.entries()].map(([phone, msg]) => ({
      phone,
      lastMessage: msg.content,
      lastRole: msg.role,
      lastActivity: msg.created_at,
      activePedido: pedidoMap.get(phone) || null,
      inHandoff: handoffSet.has(phone),
    }));

    convs.sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    setConversations(convs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("conversations-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const takeOver = async (phone: string): Promise<boolean> => {
    const { error } = await supabase.from("handoffs").insert({ cell: phone });
    if (!error) {
      setConversations((prev) =>
        prev.map((c) => (c.phone === phone ? { ...c, inHandoff: true } : c))
      );
    }
    return !error;
  };

  return { conversations, loading, takeOver, refresh: fetchAll };
}

export function useConversationMessages(phone: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((data as Message[]) || []);
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel(`chat-${phone}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `phone=eq.${phone}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [phone]);

  return { messages, loading };
}
