"use client";

import { DollarSign, CreditCard, Banknote, ShoppingBag, Beef } from "lucide-react";
import { KPICard } from "./KPICard";
import { useOrdersContext } from "@/context/OrdersContext";
import { formatCurrency } from "@/lib/utils";

export function KPIGrid() {
  const { kpis, loading } = useOrdersContext();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <KPICard label="Facturación hoy" value={formatCurrency(kpis.totalRevenue)}    icon={DollarSign} accent="text-gray-700 dark:text-white" />
      <KPICard label="Efectivo"         value={formatCurrency(kpis.cashRevenue)}     icon={Banknote}   accent="text-green-500 dark:text-green-400" />
      <KPICard label="Transferencia"    value={formatCurrency(kpis.transferRevenue)} icon={CreditCard} accent="text-blue-500 dark:text-blue-400" />
      <KPICard label="Pedidos"          value={String(kpis.orderCount)} sub="hoy"    icon={ShoppingBag} accent="text-orange-500 dark:text-orange-400" />
      <KPICard label="Hamburguesas"     value={String(kpis.burgerCount)} sub="vendidas" icon={Beef}   accent="text-amber-500 dark:text-amber-400" />
    </div>
  );
}
