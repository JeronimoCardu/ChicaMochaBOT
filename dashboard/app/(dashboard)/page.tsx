"use client";

import { OrdersProvider } from "@/context/OrdersContext";
import { useOrdersContext } from "@/context/OrdersContext";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { KanbanBoard } from "@/components/orders/KanbanBoard";
import { WaitTimeConfig } from "@/components/dashboard/WaitTimeConfig";
import { NewOrderButton } from "@/components/dashboard/NewOrderButton";

function DashboardContent() {
  const { addOrder } = useOrdersContext();
  return (
    <div className="flex flex-col p-4 md:p-5 gap-4 md:gap-5 md:h-full">
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-0.5">Pedidos</h1>
          <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500">Gestión en tiempo real · hoy</p>
        </div>
        <NewOrderButton onCreated={addOrder} />
      </div>

      <div className="shrink-0">
        <WaitTimeConfig />
      </div>

      <div className="shrink-0">
        <KPIGrid />
      </div>

      <div className="md:flex-1 md:flex md:flex-col md:min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <OrdersProvider>
      <DashboardContent />
    </OrdersProvider>
  );
}
