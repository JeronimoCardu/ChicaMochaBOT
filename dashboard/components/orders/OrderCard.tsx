"use client";

import { useState } from "react";
import { Pedido, OrderState } from "@/types";
import { formatCurrency, formatTime, formatPhone, cn } from "@/lib/utils";
import { MapPin, Phone, Clock, CreditCard, Banknote, Home, Truck, ChevronRight, ChevronLeft, GripVertical } from "lucide-react";
import { ActionMenu } from "./ActionMenu";
import { EditOrderModal } from "./EditOrderModal";

const NEXT_STATE: Partial<Record<OrderState, { label: string; next: OrderState }>> = {
  pending:  { label: "Tomar",    next: "preparing" },
  confirmed:{ label: "Tomar",    next: "preparing" },
  preparing:{ label: "Listo",    next: "ready"     },
  ready:    { label: "Entregado",next: "delivered"  },
  sent:     { label: "Entregado",next: "delivered"  },
};

const BORDER_ACCENT: Record<string, string> = {
  pending:   "border-l-red-400/60",
  confirmed: "border-l-red-400/60",
  preparing: "border-l-amber-400/60",
  ready:     "border-l-green-400/60",
  sent:      "border-l-green-400/60",
  delivered: "border-l-gray-300 dark:border-l-zinc-600/40",
  cancelled: "border-l-gray-200 dark:border-l-zinc-700/20",
};

interface Props {
  order: Pedido;
  isNew?: boolean;
  isUpdated?: boolean;
  isDragging?: boolean;
  onAction: (id: string, next: OrderState) => Promise<boolean>;
  onEditOrder?: (id: string, data: Partial<Pedido>) => Promise<boolean>;
  onDeleteOrder?: (id: string) => Promise<boolean>;
}

export function OrderCard({ order, isNew, isUpdated, isDragging, onAction, onEditOrder, onDeleteOrder }: Props) {
  const [editingOrder, setEditingOrder] = useState<Pedido | null>(null);

  const action       = NEXT_STATE[order.state];
  const borderAccent = BORDER_ACCENT[order.state] || "border-l-gray-200 dark:border-l-zinc-700/20";

  return (
    <>
    {editingOrder && onEditOrder && (
      <EditOrderModal
        pedido={editingOrder}
        onSave={(updated) => { onEditOrder(updated.id, updated); setEditingOrder(null); }}
        onClose={() => setEditingOrder(null)}
      />
    )}
    <div
      className={cn(
        "bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-4 flex flex-col gap-3 shadow-sm dark:shadow-none",
        "border-l-2",
        borderAccent,
        isNew      && "animate-slide-in ring-1 ring-orange-400/40",
        isDragging && "opacity-40 scale-[0.98] pointer-events-none"
      )}
    >
      {/* Marca de actualizado por el cliente */}
      {isUpdated && (
        <div className="flex items-center gap-1.5 -mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[11px] font-medium text-amber-500 dark:text-amber-400 tracking-wide">
            Actualizado
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="hidden md:block w-3.5 h-3.5 text-gray-300 dark:text-zinc-700 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.client}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-gray-400 dark:text-zinc-600 shrink-0" />
              <p className="text-xs text-gray-400 dark:text-zinc-600">{formatPhone(order.cell)}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {(onEditOrder || onDeleteOrder) && (
            <ActionMenu
              orderId={order.id}
              cell={order.cell}
              onEdit={() => setEditingOrder(order)}
              onDelete={() => onDeleteOrder?.(order.id)}
            />
          )}
          {order.method_pay === "cash" ? (
            <span className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-400/20">
              <Banknote className="w-3 h-3" /> Efectivo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-400/20">
              <CreditCard className="w-3 h-3" /> Transfer
            </span>
          )}
          {order.delivery_type === "delivery" ? (
            <span className="flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-400/20">
              <Truck className="w-3 h-3" /> Delivery
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-zinc-700/30 text-gray-600 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-600/20">
              <Home className="w-3 h-3" /> Retiro
            </span>
          )}
        </div>
      </div>

      {/* Location & Time */}
      <div className="space-y-1">
        {order.address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-gray-400 dark:text-zinc-600 shrink-0" />
            <p className="text-xs text-gray-600 dark:text-zinc-400">{order.address}</p>
          </div>
        )}
        {order.requested_time && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-gray-400 dark:text-zinc-600 shrink-0" />
            <p className="text-xs text-gray-600 dark:text-zinc-400">Para las {order.requested_time}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 dark:text-zinc-700">{formatTime(order.created_at)}</p>
      </div>

      {/* Items */}
      <div className="space-y-1 border-t border-gray-100 dark:border-[#1a1a1a] pt-2.5">
        {order.items.map((item, i) => (
          <p key={i} className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
            <span className="text-gray-400 dark:text-zinc-600">×{item.quantity}</span>{" "}
            {item.product_name}
            {item.size !== "doble" && <span className="text-gray-400 dark:text-zinc-500 ml-1 capitalize">{item.size}</span>}
            {item.removed_ingredients.length > 0 && <span className="text-gray-400 dark:text-zinc-600 ml-1">sin {item.removed_ingredients.join(", ")}</span>}
            {item.extra_ingredients.length > 0 && <span className="text-gray-500 dark:text-zinc-500 ml-1">+{item.extra_ingredients.join(", ")}</span>}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#1a1a1a] pt-2.5">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(Number(order.total))}</p>
        <div className="flex items-center gap-2">
          {order.state === "preparing" && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(order.id, "pending"); }}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Volver
            </button>
          )}
          {action && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(order.id, action.next); }}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors border border-gray-200 dark:border-white/10"
            >
              {action.label}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
