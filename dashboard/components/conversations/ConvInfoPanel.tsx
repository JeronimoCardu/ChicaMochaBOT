"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, MapPin, Banknote, CreditCard, Smartphone,
  Truck, Home, Clock, Package, UserCheck, Bot, AlertTriangle, X,
} from "lucide-react";
import { HumanConversation, Pedido } from "@/types";
import { ConvBadge } from "./ConvBadge";
import { supabase } from "@/lib/supabase";
import { formatPhone, formatCurrency, formatDate, formatTime, STATE_LABEL, STATE_COLOR, cn } from "@/lib/utils";

interface Props {
  conversation:  HumanConversation;
  operatorName:  string;
  onStatusChange?: () => void;
  onClose?: () => void;
}

function productEmoji(name: string): string {
  const n = name.toLowerCase();
  if (/burga|burger|hambur/.test(n))          return "🍔";
  if (/papa|frit|fritas|fries/.test(n))       return "🍟";
  if (/bebida|coca|sprite|agua|jugo/.test(n)) return "🥤";
  if (/postre|helado|dulce/.test(n))          return "🍦";
  return "🍽️";
}

const PAY_LABEL: Record<string, string> = {
  cash:     "Efectivo",
  transfer: "Transferencia",
  mp:       "Mercado Pago",
};

const PAY_CHIP: Record<string, string> = {
  cash:     "bg-green-400/10 text-green-300 border-green-400/25",
  transfer: "bg-blue-400/10 text-blue-300 border-blue-400/25",
  mp:       "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
};

function Chip({ icon, label, className }: { icon: React.ReactNode; label: string; className: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap", className)}>
      {icon}
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 border-b border-zinc-800">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function ConfirmOverlay({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 w-full max-w-xs shadow-2xl">
        <p className="text-zinc-100 text-sm mb-4 leading-relaxed">{label}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConvInfoPanel({ conversation, operatorName, onStatusChange, onClose }: Props) {
  const [latestOrder,   setLatestOrder]   = useState<Pedido | null>(null);
  const [history,       setHistory]       = useState<Pedido[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [acting,        setActing]        = useState(false);
  const [confirm,       setConfirm]       = useState<{ action: string; label: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("cell", conversation.phone)
      .order("created_at", { ascending: false })
      .limit(6);
    if (data?.length) {
      setLatestOrder(data[0] as Pedido);
      setHistory((data as Pedido[]).slice(1));
    } else {
      setLatestOrder(null);
      setHistory([]);
    }
    setLoadingOrders(false);
  }, [conversation.phone]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function runAction(action: string) {
    setActing(true);
    setConfirm(null);
    try {
      await fetch(`/api/conversations/${conversation.phone}/${action}`, {
        method:  "POST",
        headers: action === "take" ? { "Content-Type": "application/json" } : undefined,
        body:    action === "take" ? JSON.stringify({ operator_name: operatorName }) : undefined,
      });
      onStatusChange?.();
    } finally { setActing(false); }
  }

  const { status, client_name, phone, last_message_at, created_at, assigned_operator } = conversation;

  return (
    <div className="relative flex flex-col h-full bg-zinc-950 border-l border-zinc-800 overflow-y-auto w-full">

      {confirm && (
        <ConfirmOverlay
          label={`¿${confirm.label}?`}
          onConfirm={() => runAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header row with optional close (mobile overlay) */}
      {onClose && (
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-200">Información del cliente</h2>
        </div>
      )}

      {/* Client ficha */}
      <div className="px-4 pt-5 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xl font-bold text-zinc-200 shrink-0">
            {(client_name?.[0] || phone[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-zinc-100 text-base truncate">{client_name || "Sin nombre"}</p>
            <p className="text-sm text-zinc-500">{formatPhone(phone)}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-zinc-500">Estado</span>
            <ConvBadge status={status} />
          </div>
          {assigned_operator && status === "human_active" && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-zinc-500">Operador</span>
              <span className="text-sm text-blue-400 font-medium truncate">{assigned_operator}</span>
            </div>
          )}
          {last_message_at && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-zinc-500">Último mensaje</span>
              <span className="text-sm text-zinc-400">{formatTime(last_message_at)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-zinc-500">Inicio</span>
            <span className="text-sm text-zinc-400">{formatDate(created_at)}</span>
          </div>
        </div>
      </div>

      {/* Pedido actual */}
      <Section title="Pedido actual">
        {loadingOrders ? (
          <div className="flex items-center justify-center py-5">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          </div>
        ) : latestOrder ? (
          <div className="bg-zinc-900 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">#{latestOrder.id.slice(0, 8).toUpperCase()}</span>
              <span className={cn("text-sm font-semibold", STATE_COLOR[latestOrder.state])}>
                {STATE_LABEL[latestOrder.state]}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {latestOrder.items.map((item, i) => (
                <div key={i} className="text-sm leading-relaxed">
                  <span className="mr-1">{productEmoji(item.product_name)}</span>
                  <span className="font-medium text-zinc-200">×{item.quantity}</span>{" "}
                  <span className="text-zinc-300">{item.product_name}</span>
                  {item.size !== "doble" && (
                    <span className="text-zinc-500 ml-1 capitalize">{item.size}</span>
                  )}
                  {item.removed_ingredients.length > 0 && (
                    <span className="text-zinc-600 ml-1">sin {item.removed_ingredients.join(", ")}</span>
                  )}
                  {item.extra_ingredients.length > 0 && (
                    <span className="text-zinc-500 ml-1">+{item.extra_ingredients.join(", ")}</span>
                  )}
                  {item.notes && (
                    <span className="text-zinc-600 ml-1">📝 {item.notes}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="pt-2.5 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Total</span>
                <span className="text-base font-bold text-zinc-100">{formatCurrency(Number(latestOrder.total))}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-500">Pago</span>
                <Chip
                  className={PAY_CHIP[latestOrder.method_pay] || "bg-zinc-700/30 text-zinc-400 border-zinc-600/25"}
                  icon={
                    latestOrder.method_pay === "cash"     ? <Banknote   className="w-3.5 h-3.5" /> :
                    latestOrder.method_pay === "transfer" ? <CreditCard className="w-3.5 h-3.5" /> :
                                                             <Smartphone  className="w-3.5 h-3.5" />
                  }
                  label={PAY_LABEL[latestOrder.method_pay] || latestOrder.method_pay}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-500">Tipo</span>
                {latestOrder.delivery_type === "delivery" ? (
                  <Chip className="bg-orange-400/10 text-orange-300 border-orange-400/25" icon={<Truck className="w-3.5 h-3.5" />} label="Delivery" />
                ) : (
                  <Chip className="bg-zinc-700/30 text-zinc-400 border-zinc-600/25" icon={<Home className="w-3.5 h-3.5" />} label="Retiro" />
                )}
              </div>
              {latestOrder.address && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-400 break-words leading-snug">{latestOrder.address}</span>
                </div>
              )}
              {latestOrder.requested_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-sm text-zinc-400">Para las {latestOrder.requested_time}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 bg-zinc-900 rounded-xl gap-2">
            <Package className="w-9 h-9 text-zinc-700" />
            <p className="text-sm text-zinc-600 text-center">No hay pedidos asociados todavía</p>
          </div>
        )}
      </Section>

      {/* Historial */}
      {!loadingOrders && history.length > 0 && (
        <Section title="Últimos pedidos">
          <div className="space-y-0.5">
            {history.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-400">{formatDate(p.created_at)}</p>
                  <p className={cn("text-xs font-medium", STATE_COLOR[p.state])}>{STATE_LABEL[p.state]}</p>
                </div>
                <span className="text-sm font-semibold text-zinc-300 shrink-0">{formatCurrency(Number(p.total))}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Acciones rápidas */}
      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Acciones rápidas</p>
        <div className="space-y-2">
          {(status === "ai" || status === "human_requested" || status === "closed") && (
            <button
              disabled={acting}
              onClick={() => setConfirm({ action: "take", label: "Tomar esta conversación como " + operatorName })}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl bg-blue-600/20 border border-blue-600/30 text-blue-300 text-sm font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              Tomar conversación
            </button>
          )}
          {status === "human_active" && (
            <button
              disabled={acting}
              onClick={() => setConfirm({ action: "release", label: "Liberar para que otro operador atienda" })}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 shrink-0 opacity-60" />
              Liberar conversación
            </button>
          )}
          {(status === "human_requested" || status === "human_active") && (
            <button
              disabled={acting}
              onClick={() => setConfirm({ action: "close", label: "Reactivar la IA para este cliente" })}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl bg-green-600/15 border border-green-600/25 text-green-400 text-sm font-medium hover:bg-green-600/25 transition-colors disabled:opacity-50"
            >
              <Bot className="w-4 h-4 shrink-0" />
              Reactivar IA
            </button>
          )}
          {status !== "closed" && (
            <button
              disabled={acting}
              onClick={() => setConfirm({ action: "archive", label: "Cerrar esta conversación definitivamente" })}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm font-medium hover:bg-zinc-800 hover:text-zinc-400 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Cerrar conversación
            </button>
          )}
          {acting && (
            <div className="flex items-center justify-center py-1">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
