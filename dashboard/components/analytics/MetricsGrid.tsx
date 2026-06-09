"use client";

import { useAnalytics } from "@/hooks/useKPIs";
import { formatCurrency } from "@/lib/utils";
import { DailyRevenueChart, HourlyOrdersChart, TopProductsChart } from "./SalesChart";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm dark:shadow-none">
      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function MetricsGrid() {
  const { daily, hourly, topProducts, loading } = useAnalytics();

  const last30Revenue = daily.reduce((s, d) => s + d.revenue, 0);
  const last30Orders  = daily.reduce((s, d) => s + d.orders,  0);
  const last7Revenue  = daily.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const totalBurgers  = topProducts.reduce((s, p) => s + p.count, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Últimos 30 días"   value={formatCurrency(last30Revenue)} sub={`${last30Orders} pedidos`} />
        <StatCard label="Última semana"      value={formatCurrency(last7Revenue)} />
        <StatCard label="Hamburguesas (30d)" value={String(totalBurgers)} />
        <StatCard label="Más vendida"        value={topProducts[0]?.name || "—"} sub={topProducts[0] ? `${topProducts[0].count} unidades` : undefined} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DailyRevenueChart  data={daily}  />
        <HourlyOrdersChart  data={hourly} />
      </div>
      <TopProductsChart data={topProducts} />
    </div>
  );
}
