import { groceryItems, type Recipe } from '@/data/mockData';

export interface IngredientStatus {
  name: string;
  qty: string;
  status: 'available' | 'low' | 'missing';
}

/**
 * Cross-checks a recipe's ingredients against the current grocery inventory.
 * Returns each ingredient tagged with its availability status.
 */
export function checkRecipeAvailability(recipe: Recipe): {
  items: IngredientStatus[];
  availableCount: number;
  missingCount: number;
  lowCount: number;
} {
  const items: IngredientStatus[] = recipe.ingredients.map((ing) => {
    // Fuzzy match: check if any grocery item name includes the ingredient name (case-insensitive)
    const match = groceryItems.find(
      (g) => g.name.toLowerCase().includes(ing.name.toLowerCase()) ||
             ing.name.toLowerCase().includes(g.name.toLowerCase())
    );

    if (!match) return { name: ing.name, qty: ing.qty, status: 'missing' as const };
    return { name: ing.name, qty: ing.qty, status: match.status };
  });

  return {
    items,
    availableCount: items.filter((i) => i.status === 'available').length,
    lowCount: items.filter((i) => i.status === 'low').length,
    missingCount: items.filter((i) => i.status === 'missing').length,
  };
}

/**
 * Returns only the missing/low ingredients as a shopping list.
 */
export function getShoppingList(recipe: Recipe): IngredientStatus[] {
  const { items } = checkRecipeAvailability(recipe);
  return items.filter((i) => i.status !== 'available');
}
