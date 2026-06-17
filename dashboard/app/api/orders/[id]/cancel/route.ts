import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { callBackend } from "@/lib/backend";

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

  callBackend("/api/send", {
    to:      pedido.cell,
    message: "Tu pedido fue cancelado por el local 👍",
  }).catch((err) => console.error("❌ WhatsApp cancel notification failed:", err.message));

  return NextResponse.json({ success: true });
}
