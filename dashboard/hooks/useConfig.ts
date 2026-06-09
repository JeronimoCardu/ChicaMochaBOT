"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ConfigValues {
  wait_time_pickup: number;
  wait_time_delivery: number;
}

export function useConfig() {
  const [config, setConfig] = useState<ConfigValues>({
    wait_time_pickup: 20,
    wait_time_delivery: 40,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("config")
        .select("key, value")
        .in("key", ["wait_time_pickup", "wait_time_delivery"]);
      if (data) {
        const parsed = Object.fromEntries(data.map((r) => [r.key, Number(r.value)]));
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const updateValue = async (key: keyof ConfigValues, value: number): Promise<boolean> => {
    setSaving(key);
    const { error } = await supabase
      .from("config")
      .update({ value: String(value) })
      .eq("key", key);
    if (!error) setConfig((prev) => ({ ...prev, [key]: value }));
    setSaving(null);
    return !error;
  };

  return { config, loading, saving, updateValue };
}
