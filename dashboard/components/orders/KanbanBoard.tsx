"use client";

import { useMemo, useState } from "react";
import { useOrdersContext } from "@/context/OrdersContext";
import { KanbanColumn } from "./KanbanColumn";
import { Pedido, OrderState } from "@/types";
import { cn } from "@/lib/utils";

const COLUMNS: { title: string; dotColor: string; filter: (o: Pedido) => boolean; dropState: OrderState }[] = [
  { title: "Retira",         dotColor: "bg-violet-400", filter: (o) => ["pending","confirmed"].includes(o.state) && o.delivery_type === "pickup",  dropState: "pending"   },
  { title: "Delivery",       dotColor: "bg-orange-400", filter: (o) => ["pending","confirmed"].includes(o.state) && o.delivery_type === "delivery", dropState: "pending"   },
  { title: "En preparación", dotColor: "bg-amber-400",  filter: (o) => o.state === "preparing",                                                     dropState: "preparing" },
  { title: "Listos",         dotColor: "bg-green-400",  filter: (o) => ["ready","sent"].includes(o.state),                                          dropState: "ready"     },
  { title: "Entregados",     dotColor: "bg-zinc-500",   filter: (o) => ["delivered","cancelled"].includes(o.state),                                 dropState: "delivered" },
];

export function KanbanBoard() {
  const { orders, loading, newOrderId, updatedIds, updateState, updateOrder, deleteOrder } = useOrdersContext();

  const [draggingId,     setDraggingId]     = useState<string | null>(null);
  const [draggingColIdx, setDraggingColIdx] = useState<number | null>(null);
  const [columnOrders,   setColumnOrders]   = useState<Map<number, string[]>>(new Map());
  const [mobileColIdx,   setMobileColIdx]   = useState(0);

  const handleDragStart = (id: string, colIdx: number) => { setDraggingId(id); setDraggingColIdx(colIdx); };
  const handleDragEnd   = () => { setDraggingId(null); setDraggingColIdx(null); };

  const handleReorder = (toId: string, colIdx: number) => {
    if (!draggingId || draggingColIdx !== colIdx || draggingId === toId) return;
    setColumnOrders((prev) => {
      const col      = COLUMNS[colIdx];
      const filtered = orders.filter(col.filter).map((o) => o.id);
      const current  = prev.get(colIdx) ?? filtered;
      const fromIdx  = current.indexOf(draggingId);
      const toIdx    = current.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const newOrder = [...current];
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggingId);
      return new Map(prev).set(colIdx, newOrder);
    });
  };

  // Must be before any early return — Rules of Hooks.
  // Numeric dep (mobileColIdx) avoids the function-reference comparison issue
  // that caused useMemo inside KanbanColumn to not recompute on column switch.
  const mobileOrders = useMemo(
    () => orders.filter(COLUMNS[mobileColIdx].filter),
    [orders, mobileColIdx],
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-3 flex-1">
        {/* Mobile skeleton: tab bar + single column */}
        <div className="flex gap-1.5 md:hidden overflow-x-auto pb-1 shrink-0">
          {COLUMNS.map((col) => (
            <div key={col.title} className="h-7 w-24 bg-gray-200 dark:bg-[#1f1f1f] rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
        {/* Columns skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map((col) => (
            <div key={col.title} className="min-w-[280px] md:min-w-[300px] max-w-[340px] w-full md:w-auto flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2 h-2 rounded-full ${col.dotColor} opacity-30`} />
                <div className="h-4 w-24 bg-gray-200 dark:bg-[#1f1f1f] rounded animate-pulse" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="mb-3 h-40 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sharedColProps = {
    orders, newOrderId, updatedIds,
    draggingId, draggingColIdx,
    onAction: updateState,
    onEditOrder: updateOrder,
    onDeleteOrder: deleteOrder,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onReorder: handleReorder,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      {/* ── Mobile: column tab bar ── */}
      <div className="flex md:hidden overflow-x-auto shrink-0 gap-1 pb-1">
        {COLUMNS.map((col, i) => {
          const count = orders.filter(col.filter).length;
          const active = mobileColIdx === i;
          return (
            <button
              key={i}
              onClick={() => setMobileColIdx(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 border",
                active
                  ? "bg-gray-900 dark:bg-white/[0.08] text-white border-gray-800 dark:border-white/10 shadow-sm"
                  : "text-gray-500 dark:text-zinc-500 border-transparent hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-700 dark:hover:text-zinc-300"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-opacity", col.dotColor, !active && "opacity-60")} />
              {col.title}
              {count > 0 && (
                <span className={cn(
                  "ml-0.5 min-w-[18px] h-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center tabular-nums",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-zinc-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Mobile: natural height — main scrolls, no flex-1/overflow needed ── */}
      <div className="md:hidden pb-4">
        <KanbanColumn
          colIdx={mobileColIdx}
          title={COLUMNS[mobileColIdx].title}
          dotColor={COLUMNS[mobileColIdx].dotColor}
          filter={COLUMNS[mobileColIdx].filter}
          columnOrder={columnOrders.get(mobileColIdx)}
          preFilteredOrders={mobileOrders}
          fullWidth
          {...sharedColProps}
        />
      </div>

      {/* ── Desktop: all columns horizontal ── */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {COLUMNS.map((col, i) => (
          <KanbanColumn
            key={col.title}
            colIdx={i}
            title={col.title}
            dotColor={col.dotColor}
            filter={col.filter}
            columnOrder={columnOrders.get(i)}
            {...sharedColProps}
          />
        ))}
      </div>
    </div>
  );
}
