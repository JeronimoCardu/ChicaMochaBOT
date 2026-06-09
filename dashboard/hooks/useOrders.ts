"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pedido, OrderState } from "@/types";
import { todayStart } from "@/lib/utils";

async function playTone(ctx: AudioContext, frequencies: number[], stepDuration: number, gainLevel: number) {
  if (ctx.state === "suspended") await ctx.resume();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  frequencies.forEach((freq, i) => osc.frequency.setValueAtTime(freq, ctx.currentTime + i * stepDuration));
  gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + frequencies.length * stepDuration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + frequencies.length * stepDuration + 0.05);
}

export function useOrders() {
  const [orders, setOrders]         = useState<Pedido[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  // Maps order id → the column-state it was in when cancelled (for fade-out placement)
  const [fadingCancelled, setFadingCancelled] = useState<Map<string, OrderState>>(new Map());

  const audioCtxRef  = useRef<AudioContext | null>(null);
  const locallyActed = useRef<Set<string>>(new Set());
  const ordersRef    = useRef<Pedido[]>([]);

  useEffect(() => { ordersRef.current = orders; }, [orders]);

  // Inicializar y resumir AudioContext en el primer click — política de autoplay
  useEffect(() => {
    const unlock = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    };
    document.addEventListener("click", unlock, { once: false });
    return () => document.removeEventListener("click", unlock);
  }, []);

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  const playNewOrder = useCallback(() => {
    playTone(getCtx(), [880, 1100, 880], 0.12, 0.5).catch(() => {});
  }, []);

  const playClientUpdate = useCallback(() => {
    playTone(getCtx(), [520, 680], 0.12, 0.5).catch(() => {});
  }, []);

  function startFadeOut(id: string, originalState: OrderState) {
    setFadingCancelled((prev) => new Map([...prev, [id, originalState]]));
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setFadingCancelled((prev) => { const m = new Map(prev); m.delete(id); return m; });
    }, 3000);
  }

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("pedidos")
        .select("*")
        .gte("created_at", todayStart())
        .neq("state", "cancelled")
        .order("created_at", { ascending: false });
      setOrders((data as Pedido[]) || []);
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, (payload) => {
        const newOrder = payload.new as Pedido;
        setOrders((prev) => [newOrder, ...prev]);
        setNewOrderId(newOrder.id);
        playNewOrder();
        setTimeout(() => setNewOrderId(null), 3000);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos" }, (payload) => {
        const updated = payload.new as Pedido;

        if (updated.state === "cancelled") {
          if (!locallyActed.current.has(updated.id)) {
            // Cliente canceló desde WhatsApp — hacer fade-out
            const original = ordersRef.current.find((o) => o.id === updated.id);
            const originalState = (original?.state ?? "pending") as OrderState;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            startFadeOut(updated.id, originalState);
          }
          // Si fue el operador (locallyActed): cancelOrder() ya hizo el fade-out local
          return;
        }

        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

        if (!locallyActed.current.has(updated.id)) {
          setUpdatedIds((prev) => new Set([...prev, updated.id]));
          playClientUpdate();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [playNewOrder, playClientUpdate]);

  const updateState = async (id: string, state: OrderState): Promise<boolean> => {
    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);

    const extra: Partial<Pedido> = {};
    if (state === "delivered") extra.delivered_at = new Date().toISOString();
    if (state === "confirmed") extra.confirmed_at = new Date().toISOString();

    const { error } = await supabase
      .from("pedidos")
      .update({ state, updated_at: new Date().toISOString(), ...extra })
      .eq("id", id);

    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state, ...extra } : o)));
      setUpdatedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
    return !error;
  };

  const cancelOrder = useCallback(async (id: string) => {
    const original = ordersRef.current.find((o) => o.id === id);
    if (!original) return;

    const originalState = original.state;

    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);

    // Optimistic UI: mark as cancelled and start fade
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state: "cancelled" } : o)));
    startFadeOut(id, originalState);

    try {
      await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    } catch (err) {
      console.error("❌ Error al cancelar pedido:", err);
    }
  }, []);

  return { orders, loading, newOrderId, updatedIds, fadingCancelled, updateState, cancelOrder };
}
