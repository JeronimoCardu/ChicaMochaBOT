import { supabase } from "./supabase.js";

export async function getConfig() {
  const { data, error } = await supabase.from("config").select("key, value");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.key, r.value]));
}
