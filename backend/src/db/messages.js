import { supabase } from "./supabase.js";

export async function getHistory(phone, limit = 20) {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("phone", phone)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).reverse();
}

export async function saveMessage(phone, role, content) {
  const { error } = await supabase
    .from("messages")
    .insert({ phone, role, content });

  if (error) throw error;
}
