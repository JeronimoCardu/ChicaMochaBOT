import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Cierra la conversación definitivamente.
// Elimina el handoff para que el bot pueda responder si el cliente escribe de nuevo.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  const supabase = createServerClient();

  await supabase.from("handoffs").delete().eq("cell", phone);

  const { error } = await supabase
    .from("conversations")
    .update({
      status:            "closed",
      assigned_operator: null,
      human_requested_at: null,
      human_taken_at:    null,
      updated_at:        new Date().toISOString(),
    })
    .eq("phone", phone);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
