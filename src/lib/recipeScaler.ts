/**
 * Recipe Scaler — scales ingredient quantities based on servings
 */

import type { RecipeIngredient } from '@/lib/types';

/**
 * Scale ingredient quantities proportionally to target servings.
 * e.g. base recipe serves 2, user wants 4 → multiply all quantities by 2.
 */
export function scaleIngredients(
  ingredients: RecipeIngredient[],
  baseServings: number,
  targetServings: number
): RecipeIngredient[] {
  if (baseServings <= 0 || targetServings <= 0 || baseServings === targetServings) {
    return ingredients;
  }

  const ratio = targetServings / baseServings;

  return ingredients.map(ing => {
    const originalQty = parseFloat(ing.quantity);
    if (isNaN(originalQty)) {
      // Non-numeric quantity like "a pinch" — keep as-is
      return ing;
    }

    const scaled = originalQty * ratio;
    // Format nicely: integers stay integers, decimals to max 1 place
    const formatted = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);

    return { ...ing, quantity: formatted };
  });
}

/**
 * Scale a single ingredient quantity string.
 */
export function scaleQuantity(
  quantity: string,
  baseServings: number,
  targetServings: number
): string {
  if (baseServings <= 0 || targetServings <= 0 || baseServings === targetServings) {
    return quantity;
  }
  const num = parseFloat(quantity);
  if (isNaN(num)) return quantity;
  const scaled = num * (targetServings / baseServings);
  return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
}
