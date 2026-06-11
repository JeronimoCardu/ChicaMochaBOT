
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { KanbanBoard } from "@/components/orders/KanbanBoard";
import { WaitTimeConfig } from "@/components/dashboard/WaitTimeConfig";
import { NewOrderButton } from "@/components/dashboard/NewOrderButton";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full p-5 gap-5 min-h-screen">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Pedidos</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500">Gestión en tiempo real · hoy</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <NewOrderButton />
          <WaitTimeConfig />
        </div>
      </div>
      <KPIGrid />
      <div className="flex-1 flex flex-col min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
