import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function normalizePhone(phone: string): string {
  if (phone.startsWith("549") && phone.length === 13) {
    const digits = phone.slice(3);
    return `54${digits.slice(0, 4)}15${digits.slice(4)}`;
  }
  return phone;
}

async function sendWhatsApp(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("Missing WhatsApp env vars");

  const res = await fetch(
    `https://graph.facebook.com/v25.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "text",
        text: { body: text },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`WhatsApp API error: ${detail}`);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("id, cell, state, client")
    .eq("id", id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (!["pending", "preparing"].includes(pedido.state)) {
    return NextResponse.json(
      { error: "El pedido no puede cancelarse en su estado actual" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("pedidos")
    .update({ state: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Error al cancelar pedido" }, { status: 500 });
  }

  sendWhatsApp(pedido.cell, "Tu pedido fue cancelado por el local 👍").catch((err) =>
    console.error("❌ WhatsApp cancel notification failed:", err.message)
  );

  return NextResponse.json({ success: true });
}
