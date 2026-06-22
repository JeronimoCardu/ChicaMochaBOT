"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HumanConversation, ConversationStatus } from "@/types";

const PRIORITY: Record<ConversationStatus, number> = {
  human_requested: 0,
  human_active:    1,
  ai:              2,
  closed:          3,
};

export function useHumanConversations() {
  const [conversations, setConversations] = useState<HumanConversation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [newPhone,      setNewPhone]      = useState<string | null>(null);
  const [updatedPhones, setUpdatedPhones] = useState<Set<string>>(new Set());

  const audioRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    return audioRef.current;
  };

  async function playTones(freqs: number[], step: number, gain: number) {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") await ctx.resume();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = "sine";
      freqs.forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i * step));
      vol.gain.setValueAtTime(gain, ctx.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + freqs.length * step + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + freqs.length * step + 0.15);
    } catch { /* audio not available */ }
  }

  // Sonido de alerta de atención humana — tono urgente descendente x3
  const playHumanAlert = () => playTones([1100, 800, 1100, 800, 1100], 0.18, 0.65);
  // Sonido de nuevo mensaje — tono suave doble
  const playMsgAlert   = () => playTones([700, 920], 0.12, 0.4);

  // Desbloquear AudioContext en el primer click del usuario
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) { audioRef.current = new AudioContext(); return; }
      if (audioRef.current.state === "suspended") audioRef.current.resume().catch(() => {});
    };
    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, []);

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations((data as HumanConversation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("human-conversations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const next = payload.new as HumanConversation;
            setConversations((prev) => [next, ...prev]);
            if (next.status === "human_requested") {
              playHumanAlert();
              setNewPhone(next.phone);
              setTimeout(() => setNewPhone(null), 3000);
            }

          } else if (payload.eventType === "UPDATE") {
            const updated  = payload.new as HumanConversation;
            const previous = payload.old as Partial<HumanConversation>;

            setConversations((prev) => {
              const existing = prev.find((c) => c.id === updated.id);

              // Notificar si recién pasó a human_requested
              const becameHuman =
                existing?.status !== "human_requested" && updated.status === "human_requested";
              if (becameHuman) {
                playHumanAlert();
                setNewPhone(updated.phone);
                setTimeout(() => setNewPhone(null), 3000);
              }

              // Notificar si llegó un nuevo mensaje a conversación activa
              const prevCount = typeof previous.unread_count === "number" ? previous.unread_count : 0;
              const gotNewMsg =
                updated.unread_count > prevCount &&
                (updated.status === "human_requested" || updated.status === "human_active");
              if (gotNewMsg && !becameHuman) {
                playMsgAlert();
                setUpdatedPhones((s) => new Set([...s, updated.phone]));
              }

              return prev.map((c) => (c.id === updated.id ? updated : c));
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  function clearUpdated(phone: string) {
    setUpdatedPhones((s) => { const n = new Set(s); n.delete(phone); return n; });
  }

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => {
      const diff = PRIORITY[a.status] - PRIORITY[b.status];
      if (diff !== 0) return diff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }),
    [conversations],
  );

  const humanRequestedCount = useMemo(
    () => conversations.filter((c) => c.status === "human_requested").length,
    [conversations],
  );

  return {
    conversations:  sorted,
    loading,
    humanRequestedCount,
    newPhone,
    updatedPhones,
    clearUpdated,
    refresh: fetchAll,
  };
}
