import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  const supabase = createServerClient();

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* body is optional */ }

  const operatorName =
    typeof body.operator_name === "string" && body.operator_name.trim()
      ? body.operator_name.trim()
      : "Operador";

  // Insert handoff to block bot (ignore if already exists)
  await supabase.from("handoffs").insert({ cell: phone }).then(() => {});

  // Set conversation to human_active (overrides the trigger's human_requested)
  const { error } = await supabase
    .from("conversations")
    .update({
      status:            "human_active",
      assigned_operator: operatorName,
      human_taken_at:    new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    })
    .eq("phone", phone);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
