"use client";

import { ConversationStatus } from "@/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<ConversationStatus, { dot: string; label: string; bg: string; text: string }> = {
  human_requested: { dot: "bg-orange-400", label: "Solicita atención", bg: "bg-orange-400/10 border-orange-400/25", text: "text-orange-300" },
  human_active:    { dot: "bg-blue-400",   label: "Atendida",          bg: "bg-blue-400/10 border-blue-400/25",   text: "text-blue-300" },
  ai:              { dot: "bg-green-400",  label: "IA activa",         bg: "bg-green-400/10 border-green-400/25", text: "text-green-300" },
  closed:          { dot: "bg-zinc-500",   label: "Cerrada",           bg: "bg-zinc-700/30 border-zinc-600/25",   text: "text-zinc-400" },
};

export function ConvBadge({ status }: { status: ConversationStatus }) {
  const { dot, label, bg, text } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap", bg, text)}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
