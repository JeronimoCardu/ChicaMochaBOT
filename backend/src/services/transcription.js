import OpenAI, { toFile } from "openai";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getWhatsAppMediaUrl(mediaId) {
  const res = await axios.get(
    `https://graph.facebook.com/v25.0/${mediaId}`,
    { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
  );
  return res.data.url;
}

async function downloadAudio(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  return Buffer.from(res.data);
}

export async function transcribeAudio(mediaId, mimeType = "audio/ogg") {
  console.log(`🎤 Transcribiendo audio: ${mediaId}`);
  const url = await getWhatsAppMediaUrl(mediaId);
  const buffer = await downloadAudio(url);
  const ext = mimeType.includes("mp4") ? "mp4" : "ogg";
  const file = await toFile(buffer, `audio.${ext}`, { type: mimeType });
  const result = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    language: "es",
  });
  const text = result.text?.trim();
  console.log(`📝 Transcripción: ${text}`);
  return text;
}
