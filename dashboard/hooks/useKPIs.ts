"use client";

import { useEffect, useState } from "react";
import { KPIData, DailyStat, HourlyStat } from "@/types";

export function useKPIs() {
  const [kpis, setKpis] = useState<KPIData>({
    totalRevenue:    0,
    cashRevenue:     0,
    transferRevenue: 0,
    orderCount:      0,
    burgerCount:     0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      const res = await fetch("/api/dashboard/kpis");
      if (!res.ok) return;
      const data = (await res.json()) as KPIData;
      setKpis(data);
      setLoading(false);
    };

    fetchKpis();
    const interval = setInterval(fetchKpis, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { kpis, loading };
}

export function useAnalytics() {
  const [daily,       setDaily]       = useState<DailyStat[]>([]);
  const [hourly,      setHourly]      = useState<HourlyStat[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number }[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch("/api/dashboard/analytics");
      if (!res.ok) return;
      const { daily: d, hourly: h, topProducts: tp } = await res.json();
      setDaily(d ?? []);
      setHourly(h ?? []);
      setTopProducts(tp ?? []);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return { daily, hourly, topProducts, loading };
}
