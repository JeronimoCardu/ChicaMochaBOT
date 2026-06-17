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

export async function saveMessage(phone, role, content, extras = {}) {
  const record = { phone, role, content };
  if (extras.mediaUrl)              record.media_url  = extras.mediaUrl;
  if (extras.mediaType)             record.media_type = extras.mediaType;
  if (extras.isReceipt !== undefined) record.is_receipt = extras.isReceipt;

  const { error } = await supabase.from("messages").insert(record);
  if (error) throw error;
}

export async function isLikelyReceipt(phone) {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("phone", phone)
    .eq("role", "user")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(3);

  const receiptWords = /comprobante|transferencia|transfer[ií]|adjunto|te mand[eé]|te envi[eé]|ya pagu[eé]|pagué|pagu[eé]|listo\s*pag/i;
  return (data || []).some((m) => receiptWords.test(m.content));
}
