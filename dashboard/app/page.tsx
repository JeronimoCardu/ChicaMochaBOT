import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { KanbanBoard } from "@/components/orders/KanbanBoard";
import { WaitTimeConfig } from "@/components/dashboard/WaitTimeConfig";
import { NewOrderButton } from "@/components/dashboard/NewOrderButton";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full p-4 md:p-5 gap-4 md:gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-0.5">Pedidos</h1>
          <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500">Gestión en tiempo real · hoy</p>
        </div>
        <NewOrderButton />
      </div>

      {/* Wait time config — scrollable on xs if it overflows */}
      <div className="shrink-0 overflow-x-auto pb-0.5">
        <WaitTimeConfig />
      </div>

      {/* KPIs */}
      <div className="shrink-0">
        <KPIGrid />
      </div>

      {/* Kanban — fills remaining height */}
      <div className="flex-1 flex flex-col min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
