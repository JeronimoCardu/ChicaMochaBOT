// Mirror exacto del mapa en backend/src/db/combos.js
export const COMBO_INGREDIENTES: Record<string, string[]> = {
  "Burga 1": ["bacon", "crispy", "salsa de la casa"],
  "Burga 2": ["bacon", "salsa roja"],
  "Burga 3": ["roquefort", "rucula", "cebolla caramelizada"],
  "Burga 4": ["lechuga", "pepinillos", "salsa de la casa"],
  "Burga 5": ["provolone", "salsa de la casa"],
  "Burga 6": ["huevo", "bacon", "salsa roja"],
  "Burga 7": ["lechuga", "tomate", "cebolla"],
  "Burga 8": ["salsa roja"],
  "Jhon": [],
};

export function deriveComboAvailability(
  combos: { name: string; available: boolean | null }[],
  ingredientes: { name: string; available: boolean }[]
): { name: string; available: boolean; blockedBy: string | null }[] {
  const agotadosSet = new Set(
    ingredientes.filter((i) => !i.available).map((i) => i.name)
  );
  return combos.map((combo) => {
    const required = COMBO_INGREDIENTES[combo.name] || [];
    const blockedBy = required.find((ing) => agotadosSet.has(ing)) ?? null;
    return {
      name: combo.name,
      available: (combo.available ?? true) && !blockedBy,
      blockedBy,
    };
  });
}
