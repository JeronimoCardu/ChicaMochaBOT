import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { todayStart } from "@/lib/utils";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .gte("created_at", todayStart())
    .neq("state", "cancelled")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

const SIZE_EXTRA: Record<string, number> = { doble: 0, triple: 2000, "cuádruple": 4000 };
const JHON_SIZE_EXTRA: Record<string, number> = { simple: 0, doble: 2000, triple: 4000 };
const INGREDIENT_PRICE = 2000;

const VALID_DELIVERY = ["delivery", "pickup"] as const;
const VALID_PAY      = ["cash", "transfer", "mp"] as const;

async function enrichItems(
  items: { product_name: string; quantity?: number; size?: string; extra_ingredients?: string[]; removed_ingredients?: string[]; notes?: string }[],
  supabase: ReturnType<typeof createServerClient>
) {
  const names = [...new Set(items.map((i) => i.product_name))];
  const { data: combos } = await supabase.from("combos").select("name, price").in("name", names);
  const priceMap = Object.fromEntries((combos ?? []).map((c: { name: string; price: number }) => [c.name, Number(c.price)]));
  return items.map((item) => {
    const basePrice = priceMap[item.product_name] ?? 12000;
    const sizeMap = item.product_name === "Jhon" ? JHON_SIZE_EXTRA : SIZE_EXTRA;
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

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();
  const { cell, client, delivery_type, address, method_pay, requested_time, customer_notes, internal_notes, items = [] } = body;

  if (!cell || !client || !delivery_type || !method_pay) {
    return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
  }
  if (!VALID_DELIVERY.includes(delivery_type)) {
    return NextResponse.json({ error: "delivery_type inválido" }, { status: 400 });
  }
  if (!VALID_PAY.includes(method_pay)) {
    return NextResponse.json({ error: "method_pay inválido" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length > 20) {
    return NextResponse.json({ error: "items inválido" }, { status: 400 });
  }
  if (typeof cell !== "string" || cell.length > 20) {
    return NextResponse.json({ error: "cell inválido" }, { status: 400 });
  }
  if (typeof client !== "string" || client.length > 100) {
    return NextResponse.json({ error: "client inválido" }, { status: 400 });
  }

  const enrichedItems = await enrichItems(items, supabase);
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.final_price * (item.quantity ?? 1),
    0
  );
  const total = body.total !== undefined ? Number(body.total) : subtotal;

  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      cell,
      client,
      delivery_type,
      address: address || null,
      method_pay,
      requested_time: requested_time || null,
      customer_notes: customer_notes || null,
      internal_notes: internal_notes || null,
      items: enrichedItems,
      subtotal,
      total,
      state: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pedido: data });
}
