import { supabase } from "../db/supabase.js";

const MIME_TO_EXT = {
  "image/jpeg":              "jpg",
  "image/png":               "png",
  "image/gif":               "gif",
  "image/webp":              "webp",
  "image/heic":              "heic",
  "audio/ogg":               "ogg",
  "audio/mpeg":              "mp3",
  "audio/mp4":               "mp4",
  "video/mp4":               "mp4",
  "video/3gpp":              "3gp",
  "application/pdf":         "pdf",
};

export function extFromMime(mimeType) {
  const base = mimeType?.split(";")[0].trim();
  return MIME_TO_EXT[base] || "bin";
}

export async function uploadMedia(buffer, phone, mediaId, mimeType) {
  const ext      = extFromMime(mimeType);
  const baseMime = mimeType.split(";")[0].trim();
  const path     = `whatsapp/${phone}/${mediaId}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, buffer, { contentType: baseMime, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
