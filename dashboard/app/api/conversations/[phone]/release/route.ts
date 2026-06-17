import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Libera la conversación para que otro operador la tome.
// Mantiene el handoff activo (el bot no responde).
// Vuelve al estado human_requested sin operador asignado.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from("conversations")
    .update({
      status:            "human_requested",
      assigned_operator: null,
      human_taken_at:    null,
      updated_at:        new Date().toISOString(),
    })
    .eq("phone", phone);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
