"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ingrediente, Combo } from "@/types";
import { deriveComboAvailability, COMBO_INGREDIENTES } from "@/lib/combo-ingredients";

export function useIngredients() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [combos,       setCombos]       = useState<Combo[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [savingIng,    setSavingIng]    = useState<string | null>(null);
  const [savingCombo,  setSavingCombo]  = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: ings }, { data: cbs }] = await Promise.all([
        supabase.from("ingredientes").select("*").order("name"),
        supabase.from("combos").select("*").order("name"),
      ]);
      setIngredientes((ings as Ingrediente[]) || []);
      setCombos((cbs as Combo[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Ingrediente toggle — NUNCA toca combo.available.
  // El bloqueo por ingredientes es 100% dinámico (derivado).
  const toggleIngrediente = async (id: string, available: boolean): Promise<boolean> => {
    setSavingIng(id);
    try {
      const res = await fetch(`/api/ingredientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) { setSavingIng(null); return false; }
      setIngredientes((prev) => prev.map((i) => (i.id === id ? { ...i, available } : i)));
      setSavingIng(null);
      return true;
    } catch {
      setSavingIng(null);
      return false;
    }
  };

  // Combo toggle manual — escribe en combo.available (override del operador).
  // No afecta a ingredientes.
  const toggleCombo = async (name: string, available: boolean): Promise<boolean> => {
    setSavingCombo(name);
    try {
      const res = await fetch(`/api/combos/${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) { setSavingCombo(null); return false; }
      setCombos((prev) => prev.map((c) => (c.name === name ? { ...c, available } : c)));
      setSavingCombo(null);
      return true;
    } catch {
      setSavingCombo(null);
      return false;
    }
  };

  // derivedCombos: estado efectivo = manual AND no-bloqueado-por-ingrediente
  const derivedCombos = deriveComboAvailability(combos, ingredientes);

  return {
    ingredientes,
    combos,
    derivedCombos,
    loading,
    savingIng,
    savingCombo,
    toggleIngrediente,
    toggleCombo,
  };
}
