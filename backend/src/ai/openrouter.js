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
      console.log(`✅ Modelo usado: ${model}`);
      return completion.choices[0].message.content;
    } catch (err) {
      console.warn(`⚠️ ${model} falló: ${err.message}`);
    }
  }
  throw new Error("Sin modelos disponibles. Intenta en unos minutos.");
}

const EXTRACT_PROMPT = `Sos un extractor de datos. Tu única tarea es analizar una conversación de pedidos de hamburguesas y devolver JSON o null. Nada más.

CONDICIONES para pedido completo (todas deben cumplirse):
- Tiene nombre del cliente
- Tiene al menos un producto con cantidad
- Tiene delivery con dirección, O retiro en local
- Tiene método de pago

REGLA CLAVE: Si el último mensaje del asistente muestra un resumen estructurado con 🍔, 📍, 👤, 💳 y 💰, el pedido está completo aunque el cliente no haya respondido aún.

OUTPUT — elegí UNO, sin texto adicional:

A) Pedido completo — devolvé este JSON en una sola línea:
{"client":"nombre","delivery_type":"delivery|pickup","address":"dirección o null","requested_time":"HH:MM o null","method_pay":"cash|transfer|mp","subtotal":número,"total":número,"customer_notes":"nota o null","items":[{"product_name":"Burga X","base_price":12000,"quantity":1,"size":"doble|triple|cuádruple","removed_ingredients":[],"extra_ingredients":[],"extra_price":0,"final_price":12000,"notes":""}]}

B) Pedido incompleto — devolvé exactamente: null

REGLAS DE ITEMS:
- size: "doble" es la base. "triple" = +$2000. "cuádruple" = +$4000.
- extra_price = suma de todos los extras (medallones + ingredientes agregados).
- final_price = base_price + extra_price (POR UNIDAD, no multiplicado por quantity).
- removed_ingredients: solo los que el cliente pidió sacar.
- extra_ingredients: solo los que el cliente pidió agregar.

PROHIBIDO: saludar, explicar, preguntar, texto fuera del JSON o null.`;

export async function extractOrderJSON(fullConversation) {
  for (const model of MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "system", content: EXTRACT_PROMPT }, ...fullConversation],
        max_tokens: 400,
      });
      const msg = completion.choices[0]?.message;
      const rawContent = msg?.content;
      console.log(`🔍 Extracción raw (${model}):`, JSON.stringify(rawContent)?.slice(0, 300));
      const content = rawContent != null ? rawContent.trim() : null;
      if (!content || content === "null") return null;

      // Try direct parse first
      try {
        return JSON.parse(content);
      } catch {
        // Fallback: extract JSON object from response in case model added extra text
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {
            return null;
          }
        }
        return null;
      }
    } catch (err) {
      console.warn(`⚠️ extractOrder ${model} falló: ${err.message}`);
    }
  }
  return null;
}