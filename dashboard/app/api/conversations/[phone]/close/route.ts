import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  const supabase = createServerClient();

  // Delete handoffs so bot can respond again immediately
  await supabase.from("handoffs").delete().eq("cell", phone);

  // Reset conversation to AI mode
  const { error } = await supabase
    .from("conversations")
    .update({
      status:            "ai",
      assigned_operator: null,
      human_requested_at: null,
      human_taken_at:    null,
      updated_at:        new Date().toISOString(),
    })
    .eq("phone", phone);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
