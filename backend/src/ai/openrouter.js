import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODELS = [
  "anthropic/claude-haiku-4-5",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
];

export async function askAI(history, systemPrompt) {
  for (const model of MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.warn(`⚠️ Modelo ${model} no disponible: ${err.message}`);
    }
  }
  throw new Error("Sin modelos disponibles. Intenta en unos minutos.");
}