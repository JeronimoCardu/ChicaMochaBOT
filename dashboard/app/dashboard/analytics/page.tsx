import { MetricsGrid } from "@/components/analytics/MetricsGrid";

export default function AnalyticsPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Métricas</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500">Últimos 30 días · actualización en tiempo real</p>
      </div>
      <MetricsGrid />
    </div>
  );
}
