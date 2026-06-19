import { supabase } from "./supabase.js";
import { preprocessOrderData } from "../services/burgerMatcher.js";

const SIZE_EXTRA = { doble: 0, triple: 2000, cuádruple: 4000 };
const INGREDIENT_PRICE = 2000;

async function enrichItems(items) {
  const names = [...new Set(items.map((i) => i.product_name))];
  const { data: combos } = await supabase
    .from("combos")
    .select("name, price")
    .in("name", names);

  const priceMap = Object.fromEntries(
    (combos || []).map((c) => [c.name, Number(c.price)])
  );

  return items.map((item) => {
    const basePrice = priceMap[item.product_name] ?? 12000;
    const sizeExtra = SIZE_EXTRA[item.size ?? "doble"] ?? 0;
    const ingredientExtra = (item.extra_ingredients?.length ?? 0) * INGREDIENT_PRICE;
    const extraPrice = sizeExtra + ingredientExtra;
    return { ...item, base_price: basePrice, extra_price: extraPrice, final_price: basePrice + extraPrice };
  });
}

function normalizeItems(items) {
  return (items || [])
    .map((i) => ({
      product_name: i.product_name,
      quantity: i.quantity ?? 1,
      size: i.size ?? "doble",
      removed_ingredients: [...(i.removed_ingredients || [])].sort(),
      extra_ingredients: [...(i.extra_ingredients || [])].sort(),
      notes: i.notes || "",
    }))
    .sort((a, b) => a.product_name.localeCompare(b.product_name));
}

function hasChanges(existing, incoming) {
  if ((existing.requested_time ?? null) !== (incoming.requested_time || null)) return true;
  if (existing.method_pay !== incoming.method_pay) return true;
  if ((existing.address ?? null) !== (incoming.address || null)) return true;
  if (existing.delivery_type !== incoming.delivery_type) return true;
  const eItems = JSON.stringify(normalizeItems(existing.items));
  const nItems = JSON.stringify(normalizeItems(incoming.items));
  return eItems !== nItems;
}

export async function getCancelablePedidos(cell) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("pedidos")
    .select("id, client, delivery_type, address, items, state")
    .eq("cell", cell)
    .in("state", ["pending", "preparing"])
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function cancelPedido(id) {
  const { error } = await supabase
    .from("pedidos")
    .update({ state: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getActivePedido(cell) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("pedidos")
    .select("id, client, delivery_type, address, requested_time, method_pay, items, state, total, created_at")
    .eq("cell", cell)
    .in("state", ["pending", "preparing", "ready", "delivered"])
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

function isValidRequestedTime(time) {
  if (time == null) return true;
  const m = time.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  return total >= 20 * 60 && total <= 23 * 60; // 20:00–23:00 inclusive
}

export async function upsertPedido(rawData) {
  const data = preprocessOrderData(rawData);

  if (!isValidRequestedTime(data.requested_time)) {
    console.warn(`⚠️ Horario inválido bloqueado: "${data.requested_time}" — pedido no guardado`);
    return;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const enrichedItems = await enrichItems(data.items || []);
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.final_price * (item.quantity ?? 1),
    0
  );

  const payload = {
    client:         data.client,
    delivery_type:  data.delivery_type ?? (data.address ? "delivery" : "pickup"),
    address:        data.address || null,
    requested_time: data.requested_time || null,
    method_pay:     data.method_pay,
    subtotal,
    total:          subtotal,
    items:          enrichedItems,
    customer_notes: data.customer_notes || null,
  };

  // Si el AI marcó force_new=true, siempre insertar sin buscar pedido existente
  if (data.force_new) {
    const { error } = await supabase
      .from("pedidos")
      .insert({ ...payload, cell: data.cell });
    if (error) throw error;
    console.log(`🆕 Pedido nuevo forzado total: $${subtotal}`);
    return;
  }

  const { data: existing } = await supabase
    .from("pedidos")
    .select("id, requested_time, method_pay, address, delivery_type, items")
    .eq("cell", data.cell)
    .in("state", ["pending", "preparing"])
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (!hasChanges(existing, payload)) {
      console.log("⚠️ Pedido sin cambios, update ignorado");
      return;
    }
    const { error } = await supabase
      .from("pedidos")
      .update({ ...payload, was_updated: true })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`✏️  Pedido actualizado (id: ${existing.id}) total: $${subtotal}`);
  } else {
    const { error } = await supabase
      .from("pedidos")
      .insert({ ...payload, cell: data.cell });
    if (error) throw error;
    console.log(`🆕 Pedido nuevo creado total: $${subtotal}`);
  }
}
