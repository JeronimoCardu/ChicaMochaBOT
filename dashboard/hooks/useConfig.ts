"use client";

import { useEffect, useState } from "react";

interface ConfigValues {
  wait_time_pickup:    number;
  wait_time_delivery:  number;
}

export function useConfig() {
  const [config,  setConfig]  = useState<ConfigValues>({ wait_time_pickup: 20, wait_time_delivery: 40 });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const res = await fetch("/api/config");
      if (!res.ok) { setLoading(false); return; }
      const { config: data } = (await res.json()) as { config: { key: string; value: string }[] };
      if (data?.length) {
        const parsed = Object.fromEntries(data.map((r) => [r.key, Number(r.value)]));
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const updateValue = async (key: keyof ConfigValues, value: number): Promise<boolean> => {
    setSaving(key);
    try {
      const res = await fetch("/api/config", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ key, value }),
      });
      if (!res.ok) { setSaving(null); return false; }
      setConfig((prev) => ({ ...prev, [key]: value }));
      setSaving(null);
      return true;
    } catch {
      setSaving(null);
      return false;
    }
  };

  return { config, loading, saving, updateValue };
}
