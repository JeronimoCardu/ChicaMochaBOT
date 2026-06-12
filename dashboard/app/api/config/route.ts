import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const VALID_KEYS = ["wait_time_pickup", "wait_time_delivery"] as const;
type ConfigKey = (typeof VALID_KEYS)[number];

export async function PUT(req: NextRequest) {
  const supabase = createServerClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { key, value } = body as Record<string, unknown>;

  if (!key || !VALID_KEYS.includes(key as ConfigKey)) {
    return NextResponse.json({ error: "Clave inválida" }, { status: 400 });
  }

  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue < 1 || numValue > 240) {
    return NextResponse.json({ error: "Valor fuera de rango (1–240)" }, { status: 400 });
  }

  const { error } = await supabase
    .from("config")
    .update({ value: String(numValue) })
    .eq("key", key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
