"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyStat, HourlyStat } from "@/types";
import { formatCurrency } from "@/lib/utils";

function useIsDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  color: "#111111",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export function DailyRevenueChart({ data }: { data: DailyStat[] }) {
  const isDark = useIsDark();
  const grid  = isDark ? "#1f1f1f" : "#e5e5e5";
  const tick  = isDark ? "#52525b" : "#9ca3af";

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm dark:shadow-none">
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-4">Facturación por día</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [formatCurrency(v), "Facturación"]} labelStyle={{ color: "#6b7280" }} />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyOrdersChart({ data }: { data: HourlyStat[] }) {
  const isDark = useIsDark();
  const grid  = isDark ? "#1f1f1f" : "#e5e5e5";
  const tick  = isDark ? "#52525b" : "#9ca3af";

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm dark:shadow-none">
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-4">Pedidos por hora (hoy)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, "Pedidos"]} labelStyle={{ color: "#6b7280" }} />
          <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }: { data: { name: string; count: number }[] }) {
  const max = data[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm dark:shadow-none">
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-4">Top 5 hamburguesas</p>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-zinc-600 w-4">{i + 1}</span>
            <span className="text-sm text-gray-700 dark:text-zinc-300 w-20">{item.name}</span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1f1f1f] rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 dark:text-zinc-500 w-6 text-right">{item.count}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-300 dark:text-zinc-700 text-center py-4">Sin datos</p>}
      </div>
    </div>
  );
}
