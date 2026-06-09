import { supabase } from "./supabase.js";

// Ingredientes requeridos por cada combo (nombres exactos de la tabla ingredientes).
// Si un ingrediente está agotado, el combo queda automáticamente unavailable.
const COMBO_INGREDIENTES = {
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

async function fetchCombosAndIngredientes() {
  const [{ data: combos, error: e1 }, { data: ingredientes, error: e2 }] =
    await Promise.all([
      supabase.from("combos").select("name, description, price, available").order("name"),
      supabase.from("ingredientes").select("name, available"),
    ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return { combos, ingredientes };
}

// Deriva la disponibilidad real de cada combo según el stock de ingredientes.
// Un combo es unavailable si: su flag available=false OR algún ingrediente requerido está agotado.
function deriveComboAvailability(combos, ingredientes) {
  const agotadosSet = new Set(
    ingredientes.filter((i) => !i.available).map((i) => i.name),
  );
  return combos.map((combo) => {
    const required = COMBO_INGREDIENTES[combo.name] || [];
    const missingIngredients = required.filter((ing) => agotadosSet.has(ing));
    return {
      ...combo,
      available: combo.available && missingIngredients.length === 0,
      missingIngredients,
    };
  });
}

export async function getMenuContext() {
  const { combos, ingredientes } = await fetchCombosAndIngredientes();
  const derived = deriveComboAvailability(combos, ingredientes);

  const disponibles = derived.filter((c) => c.available);
  const agotados = derived.filter((c) => !c.available);

  const ingDisponibles = ingredientes
    .filter((i) => i.available)
    .map((i) => i.name)
    .join(", ");
  const ingAgotados = ingredientes
    .filter((i) => !i.available)
    .map((i) => i.name);

  let menu = "PRODUCTOS_DISPONIBLES:\n";
  for (const c of disponibles) {
    menu += `• ${c.name} ($${c.price}): ${c.description}\n`;
  }

  if (agotados.length > 0) {
    menu += `\nPRODUCTOS_AGOTADOS:\n`;
    for (const c of agotados) {
      if (c.missingIngredients && c.missingIngredients.length > 0) {
        menu += `• ${c.name} (FALTA: ${c.missingIngredients.join(", ")})\n`;
      } else {
        menu += `• ${c.name} (AGOTADO)\n`;
      }
    }
  }

  menu += `\nIngredientes disponibles: ${ingDisponibles}`;

  if (ingAgotados.length > 0) {
    menu += `\nIngredientes SIN STOCK: ${ingAgotados.join(", ")}`;
  }

  return menu;
}

export async function getComboAvailability() {
  const { combos, ingredientes } = await fetchCombosAndIngredientes();
  const derived = deriveComboAvailability(combos, ingredientes);
  const agotadosList = derived.filter((c) => !c.available);

  const agotadosPorIngrediente = {};
  for (const c of agotadosList) {
    if (c.missingIngredients && c.missingIngredients.length > 0) {
      agotadosPorIngrediente[c.name] = c.missingIngredients;
    }
  }

  return {
    available: derived.filter((c) => c.available).map((c) => c.name),
    agotados: agotadosList.map((c) => c.name),
    agotadosPorIngrediente,
  };
}
