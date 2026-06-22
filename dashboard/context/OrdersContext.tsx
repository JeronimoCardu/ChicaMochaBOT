"use client";

import { createContext, useContext, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import type { KPIData } from "@/types";

type OrdersValue = ReturnType<typeof useOrders> & { kpis: KPIData };

const OrdersContext = createContext<OrdersValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const orders = useOrders();

  // Compute KPIs from the already-polled orders — eliminates the separate
  // /api/dashboard/kpis polling interval and keeps KPIs in sync with the Kanban.
  const kpis = useMemo<KPIData>(() => {
    const result: KPIData = {
      totalRevenue:    0,
      cashRevenue:     0,
      transferRevenue: 0,
      orderCount:      0,
      burgerCount:     0,
    };
    for (const o of orders.orders) {
      if (o.state === "cancelled") continue; // skip fading-cancelled during animation
      const total = Number(o.total);
      result.totalRevenue += total;
      result.orderCount++;
      if (o.method_pay === "cash") result.cashRevenue += total;
      else result.transferRevenue += total;
      const items = (o.items as { quantity?: number }[]) || [];
      result.burgerCount += items.reduce((s, item) => s + (item.quantity || 1), 0);
    }
    return result;
  }, [orders.orders]);

  return (
    <OrdersContext.Provider value={{ ...orders, kpis }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext(): OrdersValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrdersContext must be used inside <OrdersProvider>");
  return ctx;
}
