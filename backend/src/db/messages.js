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

/**
 * extras: {
 *   mediaUrl?:      string   – public Storage URL
 *   mediaType?:     string   – "audio" | "image" | "document" | "video"
 *   mediaMimeType?: string   – original MIME type from WhatsApp
 *   transcription?: string   – Groq Whisper result (audio only)
 *   isPaymentProof?:boolean  – heuristic comprobante flag
 * }
 */
export async function saveMessage(phone, role, content, extras = {}) {
  const record = { phone, role, content };

  if (extras.mediaUrl       != null) record.media_url       = extras.mediaUrl;
  if (extras.mediaType      != null) record.media_type      = extras.mediaType;
  if (extras.mediaMimeType  != null) record.media_mime_type = extras.mediaMimeType;
  if (extras.transcription  != null) record.transcription   = extras.transcription;
  if (extras.isPaymentProof != null) record.is_payment_proof = extras.isPaymentProof;

  const { error } = await supabase.from("messages").insert(record);
  if (error) throw error;
}

/**
 * Returns true if any of the 3 most recent user messages from this phone
 * (in the last 10 min) mention a bank transfer / payment confirmation.
 */
export async function isLikelyPaymentProof(phone) {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("phone", phone)
    .eq("role", "user")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(3);

  const re = /comprobante|transferencia|transfer[ií]|adjunto|te mand[eé]|te envi[eé]|ya pagu[eé]|pagué|pagu[eé]|listo\s*pag/i;
  return (data || []).some((m) => re.test(m.content));
}

// Keep old name for backward compat within this session
export { isLikelyPaymentProof as isLikelyReceipt };
