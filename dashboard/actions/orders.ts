"use server";

import { createServerClient } from "../lib/supabase-server";
import type { OrderState } from "../types/order";

export async function updateOrderStatus(id: string, state: OrderState) {
  const supabase = createServerClient();
  const { error } = await supabase.from("pedidos").update({ state }).eq("id", id);
  if (error) throw new Error(error.message);
}
