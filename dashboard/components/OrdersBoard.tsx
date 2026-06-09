"use client";

import { useOrders } from "@/hooks/useOrders";
import OrderCard from "./OrderCard";
import type { OrderState } from "@/types";

const COLUMNS: { key: OrderState; label: string; headerClass: string; bodyClass: string }[] = [
  {
    key: "pending",
    label: "🆕 Nuevos",
    headerClass: "text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20",
    bodyClass: "border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-900/10",
  },
  {
    key: "preparing",
    label: "🔥 Preparando",
    headerClass: "text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/20",
    bodyClass: "border-orange-200 dark:border-orange-800/30 bg-orange-50 dark:bg-orange-900/10",
  },
  {
    key: "ready",
    label: "✅ Listos",
    headerClass: "text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/20",
    bodyClass: "border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10",
  },
  {
    key: "delivered",
    label: "📦 Entregados",
    headerClass: "text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/30",
    bodyClass: "border-gray-200 dark:border-zinc-700/30 bg-gray-50 dark:bg-zinc-900/20",
  },
];

export default function OrdersBoard() {
  const { orders, newOrderId, updatedIds, fadingCancelled, updateState, cancelOrder, loading } = useOrders();

  // Include fading-cancelled orders in their original column for the 3 s fade-out
  const byState = (state: OrderState) =>
    orders
      .filter((o) => {
        if (o.state === state) return true;
        if (o.state === "cancelled" && fadingCancelled.get(o.id) === state) return true;
        return false;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-4 min-h-screen bg-gray-100 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          🍔 ChicaMocha — Pedidos
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-500 capitalize">{today}</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 dark:text-zinc-600 mt-20">Cargando pedidos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colOrders = byState(col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl border-2 ${col.bodyClass} flex flex-col`}
              >
                <div
                  className={`px-3 py-2 rounded-t-2xl font-semibold text-xs ${col.headerClass}`}
                >
                  {col.label}{" "}
                  <span className="font-normal opacity-60">({colOrders.filter(o => o.state !== "cancelled").length})</span>
                </div>
                <div className="p-3 space-y-3 flex-1">
                  {colOrders.filter(o => o.state !== "cancelled").length === 0 && !colOrders.some(o => o.state === "cancelled") && (
                    <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-4">
                      Sin pedidos
                    </p>
                  )}
                  {colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isNew={order.id === newOrderId}
                      isUpdated={order.was_updated || updatedIds.has(order.id)}
                      isCancelling={fadingCancelled.has(order.id)}
                      onAction={updateState}
                      onCancel={cancelOrder}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
