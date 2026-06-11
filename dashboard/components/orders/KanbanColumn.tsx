"use client";

import { useMemo, useState } from "react";
import { Pedido, OrderState } from "@/types";
import { OrderCard } from "./OrderCard";
import { cn } from "@/lib/utils";

interface Props {
  colIdx: number;
  title: string;
  dotColor: string;
  filter: (o: Pedido) => boolean;
  orders: Pedido[];
  columnOrder: string[] | undefined;
  newOrderId: string | null;
  updatedIds: Set<string>;
  draggingId: string | null;
  draggingColIdx: number | null;
  onAction: (id: string, next: OrderState) => Promise<boolean>;
  onEditOrder: (id: string, data: Partial<Pedido>) => Promise<boolean>;
  onDeleteOrder: (id: string) => Promise<boolean>;
  onDragStart: (id: string, colIdx: number) => void;
  onDragEnd: () => void;
  onReorder: (toId: string, colIdx: number) => void;
  fullWidth?: boolean;
}

export function KanbanColumn({
  colIdx, title, dotColor, filter, orders,
  columnOrder, newOrderId, updatedIds,
  draggingId, draggingColIdx,
  onAction, onEditOrder, onDeleteOrder, onDragStart, onDragEnd, onReorder,
  fullWidth,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const filtered = useMemo(() => orders.filter(filter), [orders, filter]);

  const sorted = useMemo(() => {
    if (!columnOrder) return filtered;
    return [...filtered].sort((a, b) => {
      const ai = columnOrder.indexOf(a.id);
      const bi = columnOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [filtered, columnOrder]);

  const isDraggingFromHere = draggingColIdx === colIdx && draggingId !== null;

  return (
    <div className={cn(
      "flex flex-col",
      fullWidth ? "w-full" : "min-w-[280px] md:min-w-[300px] max-w-[340px] w-full flex-shrink-0"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">{title}</h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-zinc-600 bg-black/5 dark:bg-white/4 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/5">
          {filtered.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-[80px]">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-20 border border-dashed border-gray-200 dark:border-[#1f1f1f] rounded-xl">
            <p className="text-xs text-gray-300 dark:text-zinc-800">Sin pedidos</p>
          </div>
        ) : (
          sorted.map((order) => {
            const isBeingDragged = order.id === draggingId;
            const isDragTarget   = isDraggingFromHere && dragOverId === order.id && !isBeingDragged;

            return (
              <div
                key={order.id}
                draggable
                onDragStart={(e) => { e.stopPropagation(); onDragStart(order.id, colIdx); }}
                onDragEnd={() => { setDragOverId(null); onDragEnd(); }}
                onDragOver={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  if (isDraggingFromHere && !isBeingDragged) setDragOverId(order.id);
                }}
                onDragLeave={() => { if (dragOverId === order.id) setDragOverId(null); }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setDragOverId(null);
                  if (isDraggingFromHere && !isBeingDragged) onReorder(order.id, colIdx);
                }}
                className={cn(
                  "cursor-grab active:cursor-grabbing transition-all duration-150",
                  isDragTarget && "ring-2 ring-blue-400/40 rounded-xl scale-[1.01]"
                )}
              >
                <OrderCard
                  order={order}
                  isNew={order.id === newOrderId}
                  isUpdated={updatedIds.has(order.id)}
                  isDragging={isBeingDragged}
                  onAction={onAction}
                  onEditOrder={onEditOrder}
                  onDeleteOrder={onDeleteOrder}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
