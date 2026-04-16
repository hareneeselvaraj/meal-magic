/**
 * Units Normalization
 * Converts common cooking/grocery units to a base unit (grams or millilitres)
 * for accurate inventory comparison and low-stock detection.
 */

interface BaseUnit {
  value: number;
  baseUnit: 'g' | 'ml' | 'pcs';
}

const UNIT_TO_BASE: Record<string, { factor: number; base: 'g' | 'ml' | 'pcs' }> = {
  // Weight → grams
  'g': { factor: 1, base: 'g' },
  'gm': { factor: 1, base: 'g' },
  'gms': { factor: 1, base: 'g' },
  'gram': { factor: 1, base: 'g' },
  'grams': { factor: 1, base: 'g' },
  'kg': { factor: 1000, base: 'g' },
  'kgs': { factor: 1000, base: 'g' },
  'lb': { factor: 453.592, base: 'g' },
  'lbs': { factor: 453.592, base: 'g' },
  'oz': { factor: 28.3495, base: 'g' },

  // Volume → millilitres
  'ml': { factor: 1, base: 'ml' },
  'mls': { factor: 1, base: 'ml' },
  'l': { factor: 1000, base: 'ml' },
  'ltr': { factor: 1000, base: 'ml' },
  'litre': { factor: 1000, base: 'ml' },
  'litres': { factor: 1000, base: 'ml' },
  'liter': { factor: 1000, base: 'ml' },
  'liters': { factor: 1000, base: 'ml' },

  // Cooking volume → ml (approximate)
  'cup': { factor: 240, base: 'ml' },
  'cups': { factor: 240, base: 'ml' },
  'tbsp': { factor: 15, base: 'ml' },
  'tsp': { factor: 5, base: 'ml' },

  // Count → pieces
  'nos': { factor: 1, base: 'pcs' },
  'pcs': { factor: 1, base: 'pcs' },
  'piece': { factor: 1, base: 'pcs' },
  'pieces': { factor: 1, base: 'pcs' },
  'bunch': { factor: 1, base: 'pcs' },
  'packet': { factor: 1, base: 'pcs' },
  'pack': { factor: 1, base: 'pcs' },
  'dozen': { factor: 12, base: 'pcs' },
};

/**
 * Convert a quantity + unit to its base unit (grams, ml, or pcs)
 */
export function toBaseUnit(qty: number, unit: string): BaseUnit {
  const u = unit.toLowerCase().trim();
  const mapping = UNIT_TO_BASE[u];
  if (mapping) {
    return { value: qty * mapping.factor, baseUnit: mapping.base };
  }
  // Unknown unit → treat as pieces
  return { value: qty, baseUnit: 'pcs' };
}

/**
 * Compare two quantities, normalizing units
 */
export function compareQuantities(
  qty1: number, unit1: string,
  qty2: number, unit2: string
): { canCompare: boolean; difference: number; baseUnit: string } {
  const a = toBaseUnit(qty1, unit1);
  const b = toBaseUnit(qty2, unit2);
  if (a.baseUnit !== b.baseUnit) {
    return { canCompare: false, difference: 0, baseUnit: '' };
  }
  return { canCompare: true, difference: a.value - b.value, baseUnit: a.baseUnit };
}

/**
 * Format a base-unit value back to a human-readable form
 */
export function formatQuantity(value: number, baseUnit: 'g' | 'ml' | 'pcs'): string {
  if (baseUnit === 'g') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)} kg` : `${Math.round(value)} g`;
  }
  if (baseUnit === 'ml') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)} L` : `${Math.round(value)} ml`;
  }
  return `${Math.round(value)} pcs`;
}
