import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { todayStart } from "@/lib/utils";
import type { KPIData } from "@/types";

export async function GET() {
  const supabase = createServerClient();

  const { data: orders, error } = await supabase
    .from("pedidos")
    .select("total, method_pay, items")
    .gte("created_at", todayStart())
    .not("state", "in", "(cancelled)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: KPIData = {
    totalRevenue:    0,
    cashRevenue:     0,
    transferRevenue: 0,
    orderCount:      orders.length,
    burgerCount:     0,
  };

  for (const o of orders) {
    const total = Number(o.total);
    result.totalRevenue += total;
    if (o.method_pay === "cash") {
      result.cashRevenue += total;
    } else {
      result.transferRevenue += total;
    }
    const items = (o.items as { quantity?: number }[]) || [];
    result.burgerCount += items.reduce((s, item) => s + (item.quantity || 1), 0);
  }

  return NextResponse.json(result);
}
