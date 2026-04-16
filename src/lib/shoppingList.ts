/**
 * Shopping List Generator
 * Compares planned meal ingredients against current inventory
 * and produces a grouped shopping list of what's still needed.
 */

import type { Recipe } from '@/lib/types';
import type { GroceryItemData } from '@/data/mockData';
import { toBaseUnit, formatQuantity } from '@/lib/units';

export interface ShoppingItem {
  name: string;
  neededQty: number;
  unit: string;
  displayQty: string;
  category?: string;
  forRecipes: string[];
}

function normalizeIngredientName(name: string): string {
  return name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
}

function findMatch(items: GroceryItemData[], name: string): GroceryItemData | null {
  const n = normalizeIngredientName(name);
  return (
    items.find(i => normalizeIngredientName(i.name) === n) ||
    items.find(i => { const g = normalizeIngredientName(i.name); return n.includes(g) || g.includes(n); }) ||
    null
  );
}

export function buildShoppingList(
  plannedRecipes: Recipe[],
  inventory: GroceryItemData[]
): ShoppingItem[] {
  const needed = new Map<string, ShoppingItem>();

  for (const recipe of plannedRecipes) {
    for (const ing of (recipe.ingredients || [])) {
      const rawQty = parseFloat(ing.quantity) || 0;
      if (rawQty <= 0) continue;

      const match = findMatch(inventory, ing.name);
      const onHand = match ? match.quantity : 0;
      const need = rawQty - onHand;
      if (need <= 0) continue;

      const key = normalizeIngredientName(ing.name);
      const existing = needed.get(key);
      if (existing) {
        existing.neededQty += need;
        existing.displayQty = `${existing.neededQty.toFixed(1)} ${ing.unit}`;
        existing.forRecipes.push(recipe.name);
      } else {
        needed.set(key, {
          name: ing.name,
          neededQty: need,
          unit: ing.unit,
          displayQty: `${need.toFixed(1)} ${ing.unit}`,
          category: match?.category,
          forRecipes: [recipe.name],
        });
      }
    }
  }

  return Array.from(needed.values()).sort((a, b) =>
    (a.category ?? 'zz').localeCompare(b.category ?? 'zz')
  );
}

/**
 * Get items that are low or missing (for dashboard widget)
 */
export function getLowStockItems(inventory: GroceryItemData[]): GroceryItemData[] {
  return inventory.filter(i => i.status === 'low' || i.status === 'missing');
}

/**
 * Get recipes cookable with current inventory
 * (all ingredients available or only "as needed" items missing)
 */
export function getCookableRecipes(recipes: Recipe[], inventory: GroceryItemData[]): Recipe[] {
  return recipes.filter(recipe => {
    if (!recipe.ingredients?.length) return false;
    return recipe.ingredients.every(ing => {
      const qty = parseFloat(ing.quantity);
      if (isNaN(qty) || qty <= 0) return true; // "as needed" / "to taste" → always ok
      const match = findMatch(inventory, ing.name);
      return match && match.quantity >= qty * 0.5; // Allow 50% tolerance
    });
  });
}
