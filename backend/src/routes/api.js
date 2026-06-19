import express from "express";
import { sendWhatsAppMessage } from "../services/whatsapp.js";

const router = express.Router();

function verifyInternalKey(req, res, next) {
  const key = req.headers["x-internal-key"];
  if (!process.env.INTERNAL_API_KEY) {
    console.error("❌ [API] INTERNAL_API_KEY no configurado en Render");
    return res.status(500).json({ error: "Internal API key not configured" });
  }
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    console.warn(`⚠️ [API] Intento de acceso no autorizado a /api desde IP ${req.ip}`);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// POST /api/send — proxea un mensaje de WhatsApp en nombre del dashboard
router.post("/send", verifyInternalKey, async (req, res) => {
  const { to, message } = req.body;

  if (!to || typeof to !== "string") {
    return res.status(400).json({ error: "Campo 'to' requerido" });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Campo 'message' requerido" });
  }

  try {
    await sendWhatsAppMessage(to, message.trim());
    return res.json({ success: true });
  } catch (err) {
    const detail = err.response?.data ?? err.message;
    const code   = err.response?.data?.error?.code;

    if (code === 190) {
      console.error("🔐 [API] Error 190 — WHATSAPP_TOKEN expirado o inválido en Render. Renovarlo en Meta for Developers.");
    } else if (err.response?.status === 401) {
      console.error("🔐 [API] Error 401 — token rechazado por Meta.");
    } else {
      console.error("❌ [API] Error al enviar WhatsApp:", JSON.stringify(detail));
    }

    return res.status(502).json({
      error:  "WhatsApp send failed",
      detail: JSON.stringify(detail),
      code,
    });
  }
});

export default router;
