"use client";

import { useState } from "react";
import { useConfig } from "@/hooks/useConfig";
import { Timer, Check, Truck, Home } from "lucide-react";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  current: number;
  saving: boolean;
  disabled: boolean;
  onSave: (value: number) => Promise<boolean>;
}

function WaitField({ label, icon, current, saving, disabled, onSave }: FieldProps) {
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const val = Number(input || current);
    if (!val || val < 1 || val > 120) return;
    const ok = await onSave(val);
    if (ok) { setSaved(true); setInput(""); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 dark:text-zinc-600 shrink-0">{icon}</span>
      <span className="text-sm text-gray-600 dark:text-zinc-400 shrink-0">{label}</span>
      <input
        type="number" min="1" max="120" disabled={disabled}
        value={input !== "" ? input : current}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        className="w-14 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white text-center outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors disabled:opacity-40"
      />
      <span className="text-sm text-gray-400 dark:text-zinc-600">min</span>
      <button
        onClick={handleSave} disabled={saving || disabled}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-zinc-300 transition-colors border border-gray-200 dark:border-white/10 disabled:opacity-40 min-w-[70px] justify-center"
      >
        {saved ? <span className="flex items-center gap-1 text-green-500 dark:text-green-400"><Check className="w-3 h-3" /> OK</span>
               : saving ? "..." : "Guardar"}
      </button>
    </div>
  );
}

export function WaitTimeConfig() {
  const { config, loading, saving, updateValue } = useConfig();

  return (
    <div className="flex items-center w-fit gap-5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl px-4 py-3 shadow-sm dark:shadow-none">
      <Timer className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0" />
      <WaitField label="Retiro"   icon={<Home  className="w-3.5 h-3.5" />} current={config.wait_time_pickup}   saving={saving==="wait_time_pickup"}   disabled={loading} onSave={(v) => updateValue("wait_time_pickup",v)}   />
      <div className="w-px h-5 bg-gray-200 dark:bg-[#2a2a2a]" />
      <WaitField label="Delivery" icon={<Truck className="w-3.5 h-3.5" />} current={config.wait_time_delivery} saving={saving==="wait_time_delivery"} disabled={loading} onSave={(v) => updateValue("wait_time_delivery",v)} />
    </div>
  );
}
