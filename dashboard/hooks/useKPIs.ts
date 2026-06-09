"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { KPIData, DailyStat, HourlyStat } from "@/types";
import { todayStart } from "@/lib/utils";

export function useKPIs() {
  const [kpis, setKpis] = useState<KPIData>({
    totalRevenue: 0,
    cashRevenue: 0,
    transferRevenue: 0,
    orderCount: 0,
    burgerCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculate = async () => {
    const { data: orders } = await supabase
      .from("pedidos")
      .select("total, method_pay, items")
      .gte("created_at", todayStart())
      .not("state", "in", "(cancelled)");

    if (!orders) return;

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const cashRevenue = orders
      .filter((o) => o.method_pay === "cash")
      .reduce((s, o) => s + Number(o.total), 0);
    const transferRevenue = orders
      .filter((o) => o.method_pay !== "cash")
      .reduce((s, o) => s + Number(o.total), 0);
    const orderCount = orders.length;
    const burgerCount = orders.reduce((s, o) => {
      const items = (o.items as { quantity?: number }[]) || [];
      return s + items.reduce((si, item) => si + (item.quantity || 1), 0);
    }, 0);

    setKpis({ totalRevenue, cashRevenue, transferRevenue, orderCount, burgerCount });
    setLoading(false);
  };

  useEffect(() => {
    calculate();
    const channel = supabase
      .channel("kpis-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, calculate)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { kpis, loading };
}

export function useAnalytics() {
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [hourly, setHourly] = useState<HourlyStat[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: orders } = await supabase
        .from("pedidos")
        .select("total, created_at, items")
        .gte("created_at", thirtyDaysAgo)
        .not("state", "in", "(cancelled)");

      if (!orders) return;

      // Daily stats
      const dailyMap = new Map<string, DailyStat>();
      // Hourly stats (today)
      const todayStr = todayStart();
      const hourlyMap = new Map<string, HourlyStat>();
      // Product counts
      const productMap = new Map<string, number>();

      for (const order of orders) {
        const d = new Date(order.created_at);
        const dateKey = d.toLocaleDateString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
        });
        const hourKey = `${String(d.getHours()).padStart(2, "0")}:00`;

        const prev = dailyMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0 };
        dailyMap.set(dateKey, {
          ...prev,
          revenue: prev.revenue + Number(order.total),
          orders: prev.orders + 1,
        });

        if (order.created_at >= todayStr) {
          const hprev = hourlyMap.get(hourKey) || { hour: hourKey, orders: 0, revenue: 0 };
          hourlyMap.set(hourKey, {
            ...hprev,
            orders: hprev.orders + 1,
            revenue: hprev.revenue + Number(order.total),
          });
        }

        const items = (order.items as { product_name?: string; quantity?: number }[]) || [];
        for (const item of items) {
          if (item.product_name) {
            productMap.set(
              item.product_name,
              (productMap.get(item.product_name) || 0) + (item.quantity || 1)
            );
          }
        }
      }

      setDaily(
        [...dailyMap.values()]
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-14)
      );
      setHourly(
        [...hourlyMap.values()].sort((a, b) => a.hour.localeCompare(b.hour))
      );
      setTopProducts(
        [...productMap.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      setLoading(false);
    };

    fetch();
  }, []);

  return { daily, hourly, topProducts, loading };
}
