import axios from "axios";

// Argentina: webhook sends 549XXXXXXXXXX (13 digits, with 9)
// API expects  54XXXX15XXXXXX (14 digits, with 15)
function normalizePhone(phone) {
  if (phone.startsWith("549") && phone.length === 13) {
    const digits = phone.slice(3); // 10 digits: area + subscriber
    const area = digits.slice(0, 4);
    const subscriber = digits.slice(4);
    return `54${area}15${subscriber}`;
  }
  return phone;
}

async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
    { messaging_product: "whatsapp", to, type: "text", text: { body: text } },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function sendWhatsAppMessage(to, text) {
  const normalized = normalizePhone(to);
  try {
    await sendMessage(normalized, text);
  } catch (err) {
    const detail = err.response?.data ?? err.message;
    console.error("❌ WhatsApp send error:", JSON.stringify(detail));
    throw err;
  }
}