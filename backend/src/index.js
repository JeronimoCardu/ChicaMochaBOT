import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhook.js";
import apiRoutes from "./routes/api.js";

// ── Startup: verify required env vars ────────────────────────────────────────
const REQUIRED = [
  "PORT",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "WHATSAPP_TOKEN",
  "PHONE_NUMBER_ID",
  "VERIFY_TOKEN",
  "INTERNAL_API_KEY",
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Variables de entorno faltantes:", missing.join(", "));
  console.error("   Configurarlas en Render → Environment antes de deployar.");
} else {
  console.log("✅ Variables de entorno: todas presentes");
  // Log token prefix (safe to expose first 10 chars for debugging)
  const tok = process.env.WHATSAPP_TOKEN;
  console.log(`🔑 WHATSAPP_TOKEN: ${tok.slice(0, 10)}... (${tok.length} chars)`);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/webhook", webhookRoutes);
app.use("/api",     apiRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "CHICA MOCHA API",
    env_ok:  missing.length === 0,
    missing: missing.length > 0 ? missing : undefined,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${process.env.PORT}`);
});
