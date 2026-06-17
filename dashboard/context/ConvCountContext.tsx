"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ConvCounts {
  humanRequested: number;
  humanActive:    number;
}

const ConvCountContext = createContext<ConvCounts>({ humanRequested: 0, humanActive: 0 });
export const useConvCounts = () => useContext(ConvCountContext);

export function ConvCountProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<ConvCounts>({ humanRequested: 0, humanActive: 0 });

  async function fetchCounts() {
    const { data } = await supabase
      .from("conversations")
      .select("status")
      .in("status", ["human_requested", "human_active"]);
    if (!data) return;
    setCounts({
      humanRequested: data.filter((c) => c.status === "human_requested").length,
      humanActive:    data.filter((c) => c.status === "human_active").length,
    });
  }

  useEffect(() => {
    fetchCounts();
    const ch = supabase
      .channel("conv-count-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, fetchCounts)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return <ConvCountContext.Provider value={counts}>{children}</ConvCountContext.Provider>;
}
