import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const SIZE_EXTRA: Record<string, number>      = { doble: 0, triple: 2000, "cuádruple": 4000 };
const JHON_SIZE_EXTRA: Record<string, number> = { simple: 0, doble: 2000, triple: 4000 };
const INGREDIENT_PRICE = 2000;

const VALID_DELIVERY = ["delivery", "pickup"] as const;
const VALID_PAY      = ["cash", "transfer", "mp"] as const;
const VALID_STATES   = ["pending", "confirmed", "preparing", "ready", "sent", "delivered", "cancelled"] as const;

async function enrichItems(
  items: { product_name: string; quantity?: number; size?: string; extra_ingredients?: string[]; removed_ingredients?: string[]; notes?: string }[],
  supabase: ReturnType<typeof createServerClient>
) {
  const names = [...new Set(items.map((i) => i.product_name))];
  const { data: combos } = await supabase.from("combos").select("name, price").in("name", names);
  const priceMap = Object.fromEntries((combos ?? []).map((c: { name: string; price: number }) => [c.name, Number(c.price)]));
  return items.map((item) => {
    const basePrice = priceMap[item.product_name] ?? 12000;
    const sizeMap   = item.product_name === "Jhon" ? JHON_SIZE_EXTRA : SIZE_EXTRA;
    const sizeExtra = sizeMap[item.size ?? (item.product_name === "Jhon" ? "simple" : "doble")] ?? 0;
    const ingredientExtra = (item.extra_ingredients?.length ?? 0) * INGREDIENT_PRICE;
    const extraPrice = sizeExtra + ingredientExtra;
    return {
      ...item,
      quantity: item.quantity ?? 1,
      size: item.size ?? "doble",
      removed_ingredients: item.removed_ingredients ?? [],
      extra_ingredients: item.extra_ingredients ?? [],
      notes: item.notes ?? "",
      base_price: basePrice,
      extra_price: extraPrice,
      final_price: basePrice + extraPrice,
    };
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from("pedidos").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  return NextResponse.json({ pedido: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { state } = body;

  if (!state || !VALID_STATES.includes(state as (typeof VALID_STATES)[number])) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const extra: Record<string, string> = {};
  if (state === "delivered") extra.delivered_at = new Date().toISOString();
  if (state === "confirmed") extra.confirmed_at = new Date().toISOString();

  const { error } = await supabase
    .from("pedidos")
    .update({ state, updated_at: new Date().toISOString(), ...extra })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const body = await req.json();

  if ("delivery_type" in body && !VALID_DELIVERY.includes(body.delivery_type)) {
    return NextResponse.json({ error: "delivery_type inválido" }, { status: 400 });
  }
  if ("method_pay" in body && !VALID_PAY.includes(body.method_pay)) {
    return NextResponse.json({ error: "method_pay inválido" }, { status: 400 });
  }
  if ("state" in body && !VALID_STATES.includes(body.state)) {
    return NextResponse.json({ error: "state inválido" }, { status: 400 });
  }
  if ("items" in body && (!Array.isArray(body.items) || body.items.length > 20)) {
    return NextResponse.json({ error: "items inválido" }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    was_updated: true,
  };

  const fields = ["client", "delivery_type", "address", "method_pay", "requested_time", "state", "customer_notes", "internal_notes"] as const;
  for (const field of fields) {
    if (field in body) {
      updatePayload[field] = body[field] === "" ? null : body[field];
    }
  }

  if (body.items !== undefined) {
    const enrichedItems = await enrichItems(body.items, supabase);
    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + item.final_price * (item.quantity ?? 1),
      0
    );
    updatePayload.items = enrichedItems;
    updatePayload.subtotal = subtotal;
    updatePayload.total = body.total !== undefined ? Number(body.total) : subtotal;
  } else if (body.total !== undefined) {
    updatePayload.total = Number(body.total);
  }

  const { data, error } = await supabase
    .from("pedidos")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pedido: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
