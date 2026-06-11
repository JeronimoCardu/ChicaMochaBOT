import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
}

export function KPICard({ label, value, sub, icon: Icon, accent = "text-zinc-400" }: Props) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-4 md:p-5 flex flex-col gap-2.5 md:gap-3 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-500 font-medium uppercase tracking-wider leading-none truncate">{label}</span>
        <div className={cn("w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center", accent)}>
          <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
      </div>
      <div>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>
        {sub && <p className="text-[11px] md:text-xs text-gray-400 dark:text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
