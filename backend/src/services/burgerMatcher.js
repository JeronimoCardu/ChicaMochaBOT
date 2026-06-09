// Full ingredient lists for each matchable combo (display format sent to AI in dynamic context)
export const MATCHABLE_PRODUCTS = {
  "Burga 1": ["doble carne", "doble cheddar", "bacon", "crispy", "salsa de la casa"],
  "Burga 2": ["doble carne", "doble cheddar", "bacon", "salsa roja"],
  "Burga 3": ["doble carne", "doble roquefort", "rucula", "cebolla caramelizada"],
  "Burga 4": ["doble carne", "doble cheddar", "lechuga", "pepinillos", "salsa de la casa"],
  "Burga 5": ["doble carne", "doble cheddar", "provolone", "salsa de la casa"],
  "Burga 6": ["doble carne", "doble cheddar", "huevo", "bacon", "salsa roja"],
  "Burga 7": ["doble carne", "doble cheddar", "lechuga", "tomate", "cebolla"],
  "Burga 8": ["doble carne", "doble cheddar", "salsa roja"],
};

// Products that never participate in ingredient matching
export const SPECIAL_PRODUCTS = ["Jhon"];

// Normalized effective ingredients per combo (excluding "doble carne" which is always present).
// These names must match what the AI uses in removed_ingredients / extra_ingredients.
const COMBO_EFFECTIVE_INGREDIENTS = {
  "Burga 1": ["cheddar", "bacon", "crispy", "salsa de la casa"],
  "Burga 2": ["cheddar", "bacon", "salsa roja"],
  "Burga 3": ["roquefort", "rucula", "cebolla caramelizada"],
  "Burga 4": ["cheddar", "lechuga", "pepinillos", "salsa de la casa"],
  "Burga 5": ["cheddar", "provolone", "salsa de la casa"],
  "Burga 6": ["cheddar", "huevo", "bacon", "salsa roja"],
  "Burga 7": ["cheddar", "lechuga", "tomate", "cebolla"],
  "Burga 8": ["cheddar", "salsa roja"],
};

const VALID_SIZES = ["doble", "triple", "cuádruple"];

function applyEquivalences(item) {
  let { product_name, extra_ingredients = [], removed_ingredients = [] } = item;

  // Special products never participate in matching or equivalences
  if (SPECIAL_PRODUCTS.includes(product_name)) return item;
  if (!COMBO_EFFECTIVE_INGREDIENTS[product_name]) return item;

  // Explicit equivalence: Burga 2 + huevo = Burga 6
  if (product_name === "Burga 2" && extra_ingredients.includes("huevo")) {
    return {
      ...item,
      product_name: "Burga 6",
      extra_ingredients: extra_ingredients.filter((i) => i !== "huevo"),
      removed_ingredients,
    };
  }

  // Generic equivalence: if removing ingredients from this combo produces an exact match
  // of another combo's ingredient set, rename to that combo and clear removed list.
  // Example: Burga 2 - bacon = {cheddar, salsa roja} = Burga 8 → rename to Burga 8, $0 charge.
  const baseIngredients = COMBO_EFFECTIVE_INGREDIENTS[product_name];
  const removedSet = new Set(removed_ingredients);
  const effective = baseIngredients.filter((i) => !removedSet.has(i));
  const effectiveSet = new Set(effective);

  for (const [name, ings] of Object.entries(COMBO_EFFECTIVE_INGREDIENTS)) {
    if (name === product_name || SPECIAL_PRODUCTS.includes(name)) continue;
    const comboSet = new Set(ings);
    if (
      effectiveSet.size === comboSet.size &&
      [...effectiveSet].every((i) => comboSet.has(i))
    ) {
      product_name = name;
      removed_ingredients = [];
      break;
    }
  }

  return { ...item, product_name, extra_ingredients, removed_ingredients };
}

export function preprocessOrderItem(item) {
  // Always default to "doble" if size is missing or unrecognized
  const size = VALID_SIZES.includes(item.size) ? item.size : "doble";
  return applyEquivalences({ ...item, size });
}

export function preprocessOrderData(orderData) {
  if (!orderData?.items) return orderData;
  return { ...orderData, items: orderData.items.map(preprocessOrderItem) };
}

// Static JSON exported once (sent to AI in dynamic context each request)
export const MATCHING_CONTEXT_JSON = JSON.stringify(
  { MATCHABLE_PRODUCTS, SPECIAL_PRODUCTS },
  null,
  2,
);
