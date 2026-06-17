import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Cron: diariamente a las 23:59 hora Argentina (02:59 UTC del día siguiente)
// Vercel cron schedule: "59 2 * * *"
export async function GET(req: NextRequest) {
  const secret   = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Devolver todas las conversaciones humanas activas a modo IA
  const { error, data } = await supabase
    .from("conversations")
    .update({
      status:            "ai",
      assigned_operator: null,
      human_requested_at: null,
      human_taken_at:    null,
      updated_at:        new Date().toISOString(),
    })
    .in("status", ["human_requested", "human_active"])
    .select("id");

  const count = data?.length ?? 0;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Limpiar todos los handoffs para que el bot pueda responder
  await supabase
    .from("handoffs")
    .delete()
    .gte("id", "00000000-0000-0000-0000-000000000000");

  console.log(`🔄 Reset nocturno: ${count} conversaciones devueltas a IA`);

  return NextResponse.json({
    success:   true,
    reset:     count,
    timestamp: new Date().toISOString(),
  });
}
