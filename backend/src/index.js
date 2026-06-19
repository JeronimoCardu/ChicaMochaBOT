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
  "WEBHOOK_APP_SECRET",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Variables de entorno faltantes:", missing.join(", "));
  console.error("   Configurarlas en Render → Environment antes de deployar.");
  process.exit(1);
}

console.log("✅ Variables de entorno: todas presentes");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN;
const allowedOrigins = [
  DASHBOARD_ORIGIN,
  "http://localhost:3000",
  "http://localhost:4000",
].filter(Boolean);

if (!DASHBOARD_ORIGIN) {
  console.warn("⚠️  DASHBOARD_ORIGIN no configurado — CORS permite todos los orígenes");
}

app.use(
  cors({
    origin: DASHBOARD_ORIGIN
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error("CORS: origen no permitido"));
        }
      : true,
    credentials: true,
  })
);

// ── Body parsing con captura de raw body para verificación de firma ───────────
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use("/webhook", webhookRoutes);
app.use("/api",     apiRoutes);

app.get("/", (_req, res) => {
  res.json({ service: "CHICA MOCHA API", status: "ok" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${process.env.PORT}`);
});
