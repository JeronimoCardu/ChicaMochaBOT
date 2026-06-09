"use client";

import { useIngredients } from "@/hooks/useIngredients";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

function Toggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0",
        enabled ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">{title}</h2>
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        {children}
      </div>
    </div>
  );
}

export function IngredientTable() {
  const {
    ingredientes,
    derivedCombos,
    combos,
    loading,
    savingIng,
    savingCombo,
    toggleIngrediente,
    toggleCombo,
  } = useIngredients();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ingredientes */}
      <SectionCard title="Ingredientes">
        {ingredientes.map((ing, i) => (
          <div
            key={ing.id}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              i !== ingredientes.length - 1 && "border-b border-gray-50 dark:border-[#1a1a1a]"
            )}
          >
            <span className="text-sm text-gray-800 dark:text-zinc-200 capitalize">{ing.name}</span>
            <Toggle
              enabled={ing.available}
              disabled={savingIng === ing.id}
              onChange={(v) => toggleIngrediente(ing.id, v)}
            />
          </div>
        ))}
      </SectionCard>

      {/* Combos */}
      <SectionCard title="Productos">
        {derivedCombos.map((derived, i) => {
          const combo       = combos.find((c) => c.name === derived.name);
          const manualOn    = combo?.available !== false; // toggle manual
          const isBlocked   = !!derived.blockedBy;       // bloqueado por ingrediente
          const isSaving    = savingCombo === derived.name;

          return (
            <div
              key={derived.name}
              className={cn(
                "flex items-center justify-between px-4 py-3 gap-3",
                i !== derivedCombos.length - 1 && "border-b border-gray-50 dark:border-[#1a1a1a]"
              )}
            >
              {/* Nombre + razón de bloqueo */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-800 dark:text-zinc-200 truncate">{derived.name}</span>
                {isBlocked && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-400/20 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    sin {derived.blockedBy}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Estado efectivo */}
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    derived.available
                      ? "bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-400/20"
                      : "bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20"
                  )}
                >
                  {derived.available ? "Disponible" : "No disponible"}
                </span>

                {/* Toggle manual — deshabilitado si el bloqueo es por ingrediente */}
                <Toggle
                  enabled={manualOn && !isBlocked}
                  disabled={isSaving || isBlocked}
                  onChange={(v) => toggleCombo(derived.name, v)}
                />
              </div>
            </div>
          );
        })}

        {/* Leyenda */}
        <div className="px-4 py-2.5 border-t border-gray-50 dark:border-[#1a1a1a] bg-gray-50 dark:bg-transparent">
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            El toggle activa/desactiva manualmente. Si un ingrediente está agotado, el combo se bloquea automáticamente.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
