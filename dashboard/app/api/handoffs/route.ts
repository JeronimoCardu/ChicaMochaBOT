import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { cell } = body as Record<string, unknown>;

  if (!cell || typeof cell !== "string" || cell.length > 20) {
    return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
  }

  const { error } = await supabase.from("handoffs").insert({ cell });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
