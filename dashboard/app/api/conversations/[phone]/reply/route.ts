import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { callBackend, BackendError } from "@/lib/backend";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  const supabase = createServerClient();

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { message, operator_name } = body as Record<string, unknown>;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }
  if (message.length > 4096) {
    return NextResponse.json({ error: "Mensaje demasiado largo (máx 4096)" }, { status: 400 });
  }

  const opName = typeof operator_name === "string" && operator_name.trim()
    ? operator_name.trim()
    : "Operador";

  const { error } = await supabase.from("messages").insert({
    phone,
    role:          "human",
    content:       message.trim(),
    operator_name: opName,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await callBackend("/api/send", { to: phone, message: message.trim() });
  } catch (err) {
    const detail = err instanceof BackendError ? err.message : String(err);
    console.error("❌ WhatsApp reply error:", detail);
    return NextResponse.json(
      { success: false, saved: true, error: `Mensaje guardado pero no se pudo enviar por WhatsApp: ${detail}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
