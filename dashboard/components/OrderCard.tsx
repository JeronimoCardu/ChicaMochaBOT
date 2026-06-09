"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Banknote, CreditCard, Home, Truck, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pedido, OrderState } from "@/types";

const NEXT_STATE: Partial<Record<OrderState, { label: string; next: OrderState }>> = {
  pending:   { label: "Preparando", next: "preparing" },
  preparing: { label: "Listo",      next: "ready"     },
  ready:     { label: "Entregado",  next: "delivered"  },
};

interface Props {
  order: Pedido;
  isNew?: boolean;
  isUpdated?: boolean;
  isCancelling?: boolean;
  onAction: (id: string, state: OrderState) => Promise<boolean>;
  onCancel?: (id: string) => void;
}

export default function OrderCard({ order, isNew, isUpdated, isCancelling, onAction, onCancel }: Props) {
  const [loading, setLoading]                   = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [fadeOut, setFadeOut]                   = useState(false);

  const isCancelled = order.state === "cancelled";
  const action      = NEXT_STATE[order.state];
  const canCancel   = (order.state === "pending" || order.state === "preparing") && !isCancelling;

  // Start fade-out animation 2 s after entering fading state; parent removes from DOM at 3 s
  useEffect(() => {
    if (isCancelling) {
      const t = setTimeout(() => setFadeOut(true), 2000);
      return () => clearTimeout(t);
    }
    setFadeOut(false);
  }, [isCancelling]);

  async function handleAction() {
    if (!action) return;
    setLoading(true);
    try { await onAction(order.id, action.next); }
    finally { setLoading(false); }
  }

  const createdAt = new Date(order.created_at).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "border rounded-xl p-3 flex flex-col gap-2 shadow-sm border-l-2",
        "transition-opacity duration-1000",
        fadeOut ? "opacity-0" : "opacity-100",
        (isCancelled || isCancelling)
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 border-l-red-500"
          : "bg-white dark:bg-[#111111] border-gray-200 dark:border-[#1f1f1f]",
        !isCancelled && !isCancelling && isNew      && "border-l-orange-400 ring-1 ring-orange-300/40",
        !isCancelled && !isCancelling && isUpdated && !isNew && "border-l-amber-400",
        !isCancelled && !isCancelling && !isNew && !isUpdated && "border-l-gray-200 dark:border-l-zinc-700/40"
      )}
    >
      {/* Cancelled badge */}
      {(isCancelled || isCancelling) && (
        <div className="flex items-center gap-1.5 -mb-0.5">
          <X className="w-3 h-3 text-red-500" />
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400">Cancelado</span>
        </div>
      )}

      {/* Updated badge */}
      {isUpdated && !isCancelled && !isCancelling && (
        <div className="flex items-center gap-1.5 -mb-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pedido actualizado</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className={cn(
            "font-bold text-sm leading-tight",
            (isCancelled || isCancelling) ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"
          )}>
            {order.client}
          </p>
          <p className="text-xs text-gray-400 dark:text-zinc-600">{createdAt}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {order.method_pay === "cash" ? (
            <span className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
              <Banknote className="w-3 h-3" /> Efectivo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
              <CreditCard className="w-3 h-3" /> Transfer
            </span>
          )}
          {order.delivery_type === "delivery" ? (
            <span className="flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
              <Truck className="w-3 h-3" /> Delivery
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-zinc-700/30 text-gray-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">
              <Home className="w-3 h-3" /> Retiro
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-0.5">
        {(order.items ?? []).map((item, i) => (
          <p key={i} className={cn(
            "text-xs leading-relaxed",
            (isCancelled || isCancelling)
              ? "text-red-500/60 dark:text-red-400/50 line-through"
              : "text-gray-700 dark:text-zinc-300"
          )}>
            <span className="text-gray-400 dark:text-zinc-600">×{item.quantity}</span>{" "}
            <span className="font-medium">{item.product_name}</span>
            {item.size !== "doble" && (
              <span className="text-purple-500 dark:text-purple-400 ml-1 capitalize">{item.size}</span>
            )}
            {item.removed_ingredients?.length > 0 && (
              <span className="text-gray-400 dark:text-zinc-600 ml-1">sin {item.removed_ingredients.join(", ")}</span>
            )}
            {item.extra_ingredients?.length > 0 && (
              <span className="text-gray-500 dark:text-zinc-500 ml-1">+{item.extra_ingredients.join(", ")}</span>
            )}
          </p>
        ))}
      </div>

      {/* Location & time */}
      <div className="text-xs text-gray-500 dark:text-zinc-500 space-y-0.5 border-t border-gray-100 dark:border-zinc-800 pt-2">
        {order.address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{order.address}</span>
          </div>
        )}
        {order.requested_time && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Para las {order.requested_time}</span>
          </div>
        )}
      </div>

      {/* Footer — active order */}
      {!isCancelled && !isCancelling && (
        <div className="border-t border-gray-100 dark:border-zinc-800 pt-2">
          {confirmingCancel ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                ¿Cancelar pedido de {order.client}?
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setConfirmingCancel(false); onCancel?.(order.id); }}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Sí
                </button>
                <button
                  onClick={() => setConfirmingCancel(false)}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                ${Number(order.total).toLocaleString("es-AR")}
              </p>
              <div className="flex items-center gap-1.5">
                {canCancel && (
                  <button
                    onClick={() => setConfirmingCancel(true)}
                    className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors border border-red-200 dark:border-red-900/30"
                  >
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                )}
                {action && (
                  <button
                    onClick={handleAction}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors border border-gray-200 dark:border-white/10 disabled:opacity-50"
                  >
                    {loading ? "..." : action.label}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer — cancelled order */}
      {(isCancelled || isCancelling) && (
        <div className="border-t border-red-100 dark:border-red-900/30 pt-2">
          <p className="font-semibold text-red-400/70 dark:text-red-600/70 text-sm line-through">
            ${Number(order.total).toLocaleString("es-AR")}
          </p>
        </div>
      )}
    </div>
  );
}
