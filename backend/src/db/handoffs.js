import { supabase } from "./supabase.js";

export async function isInHandoff(cell) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("handoffs")
    .select("id")
    .eq("cell", cell)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export async function saveHandoff(cell) {
  const { error } = await supabase.from("handoffs").insert({ cell });
  if (error) throw error;
}
