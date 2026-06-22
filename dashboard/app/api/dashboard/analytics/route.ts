import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { todayStart } from "@/lib/utils";

function argHour(isoString: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour:     "2-digit",
    hour12:   false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).formatToParts(new Date(isoString));
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  return `${h.padStart(2, "0")}:00`;
}

export async function GET() {
  const supabase = createServerClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayISO = todayStart();

  const { data: orders, error } = await supabase
    .from("pedidos")
    .select("total, created_at, items")
    .gte("created_at", thirtyDaysAgo)
    .not("state", "in", "(cancelled)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const dailyMap   = new Map<string, { date: string; revenue: number; orders: number }>();
  const hourlyMap  = new Map<string, { hour: string; orders: number; revenue: number }>();
  const productMap = new Map<string, number>();

  for (const order of orders) {
    const dateKey = new Date(order.created_at).toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
    const hourKey = argHour(order.created_at);

    const prev = dailyMap.get(dateKey) ?? { date: dateKey, revenue: 0, orders: 0 };
    dailyMap.set(dateKey, {
      ...prev,
      revenue: prev.revenue + Number(order.total),
      orders:  prev.orders + 1,
    });

    if (order.created_at >= todayISO) {
      const hprev = hourlyMap.get(hourKey) ?? { hour: hourKey, orders: 0, revenue: 0 };
      hourlyMap.set(hourKey, {
        ...hprev,
        orders:  hprev.orders + 1,
        revenue: hprev.revenue + Number(order.total),
      });
    }

    const items = (order.items as { product_name?: string; quantity?: number }[]) || [];
    for (const item of items) {
      if (item.product_name) {
        productMap.set(
          item.product_name,
          (productMap.get(item.product_name) || 0) + (item.quantity || 1)
        );
      }
    }
  }

  const daily = [...dailyMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const hourly = [...hourlyMap.values()].sort((a, b) => a.hour.localeCompare(b.hour));

  const topProducts = [...productMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({ daily, hourly, topProducts });
}
