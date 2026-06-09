"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { KanbanColumn } from "./KanbanColumn";
import { Pedido, OrderState } from "@/types";

const COLUMNS: { title: string; dotColor: string; filter: (o: Pedido) => boolean; dropState: OrderState }[] = [
  { title: "Retira",        dotColor: "bg-violet-400", filter: (o) => ["pending","confirmed"].includes(o.state) && o.delivery_type === "pickup",  dropState: "pending"   },
  { title: "Delivery",      dotColor: "bg-orange-400", filter: (o) => ["pending","confirmed"].includes(o.state) && o.delivery_type === "delivery", dropState: "pending"   },
  { title: "En preparación",dotColor: "bg-amber-400",  filter: (o) => o.state === "preparing",                                                     dropState: "preparing" },
  { title: "Listos",        dotColor: "bg-green-400",  filter: (o) => ["ready","sent"].includes(o.state),                                          dropState: "ready"     },
  { title: "Entregados",    dotColor: "bg-zinc-500",   filter: (o) => ["delivered","cancelled"].includes(o.state),                                 dropState: "delivered" },
];

export function KanbanBoard() {
  const { orders, loading, newOrderId, updatedIds, updateState } = useOrders();

  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [draggingColIdx,setDraggingColIdx]= useState<number | null>(null);
  // Orden manual por columna (solo en cliente, no persiste)
  const [columnOrders,  setColumnOrders]  = useState<Map<number, string[]>>(new Map());

  const handleDragStart = (id: string, colIdx: number) => {
    setDraggingId(id);
    setDraggingColIdx(colIdx);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDraggingColIdx(null);
  };

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

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.title} className="min-w-[300px] max-w-[340px] w-full">
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
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
      {COLUMNS.map((col, i) => (
        <KanbanColumn
          key={col.title}
          colIdx={i}
          title={col.title}
          dotColor={col.dotColor}
          filter={col.filter}
          orders={orders}
          columnOrder={columnOrders.get(i)}
          newOrderId={newOrderId}
          updatedIds={updatedIds}
          draggingId={draggingId}
          draggingColIdx={draggingColIdx}
          onAction={updateState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onReorder={handleReorder}
        />
      ))}
    </div>
  );
}
