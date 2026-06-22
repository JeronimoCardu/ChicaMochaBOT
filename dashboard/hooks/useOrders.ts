"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pedido, OrderState } from "@/types";

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
  const [orders,         setOrders]         = useState<Pedido[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [newOrderId,     setNewOrderId]     = useState<string | null>(null);
  const [updatedIds,     setUpdatedIds]     = useState<Set<string>>(new Set());
  const [fadingCancelled, setFadingCancelled] = useState<Map<string, OrderState>>(new Map());

  const audioCtxRef        = useRef<AudioContext | null>(null);
  const locallyActed       = useRef<Set<string>>(new Set());
  const ordersRef          = useRef<Pedido[]>([]);
  const fadingCancelledRef = useRef<Map<string, OrderState>>(new Map());

  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { fadingCancelledRef.current = fadingCancelled; }, [fadingCancelled]);

  // Desbloquear AudioContext en el primer click del usuario
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

  // Lee pedidos desde la API route (service role, bypasea RLS)
  const pollOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (!res.ok) return;
    const { orders: incoming } = (await res.json()) as { orders: Pedido[] };

    const prev      = ordersRef.current;
    const prevMap   = new Map(prev.map((o) => [o.id, o]));
    const fadingIds = new Set([...fadingCancelledRef.current.keys()]);

    // Detectar pedidos nuevos que no fueron creados por esta sesión
    for (const o of incoming) {
      if (!prevMap.has(o.id) && !locallyActed.current.has(o.id)) {
        setNewOrderId(o.id);
        playNewOrder();
        setTimeout(() => setNewOrderId(null), 3000);
        break; // una sola notificación por ciclo de poll
      }
    }

    // Detectar cambios de estado externos (cliente cancela por WhatsApp, etc.)
    for (const o of incoming) {
      const p = prevMap.get(o.id);
      if (p && !locallyActed.current.has(o.id) && p.state !== o.state) {
        setUpdatedIds((s) => new Set([...s, o.id]));
        playClientUpdate();
        break;
      }
    }

    // Preservar pedidos en fade-out durante su animación (3s), reemplazar el resto
    const fadingOrders = prev.filter((o) => fadingIds.has(o.id));
    setOrders([...fadingOrders, ...incoming.filter((o) => !fadingIds.has(o.id))]);
    setLoading(false);
  }, [playNewOrder, playClientUpdate]);

  useEffect(() => {
    pollOrders();
    const interval = setInterval(pollOrders, 5000);
    return () => clearInterval(interval);
  }, [pollOrders]);

  // ── Mutaciones — ya usaban API routes con service role, sin cambios ──

  const updateState = async (id: string, state: OrderState): Promise<boolean> => {
    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ state }),
      });
      if (!res.ok) return false;
      const extra: Partial<Pedido> = {};
      if (state === "delivered") extra.delivered_at = new Date().toISOString();
      if (state === "confirmed") extra.confirmed_at = new Date().toISOString();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state, ...extra } : o)));
      setUpdatedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      return true;
    } catch {
      return false;
    }
  };

  const cancelOrder = useCallback(async (id: string) => {
    const original = ordersRef.current.find((o) => o.id === id);
    if (!original) return;
    const originalState = original.state;
    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state: "cancelled" } : o)));
    startFadeOut(id, originalState);
    try {
      await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    } catch (err) {
      console.error("❌ Error al cancelar pedido:", err);
    }
  }, []);

  const updateOrder = useCallback(async (id: string, data: Partial<Pedido>): Promise<boolean> => {
    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (!res.ok) return false;
      const { pedido: updated } = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    locallyActed.current.add(id);
    setTimeout(() => locallyActed.current.delete(id), 4000);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) return false;
      setOrders((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const addOrder = useCallback((order: Pedido) => {
    setOrders((prev) => [order, ...prev]);
    setNewOrderId(order.id);
    setTimeout(() => setNewOrderId(null), 3000);
  }, []);

  return {
    orders,
    loading,
    newOrderId,
    updatedIds,
    fadingCancelled,
    updateState,
    cancelOrder,
    updateOrder,
    deleteOrder,
    addOrder,
  };
}
