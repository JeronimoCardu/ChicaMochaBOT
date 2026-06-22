"use client";

import { useEffect, useState } from "react";
import { DailyStat, HourlyStat } from "@/types";

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
