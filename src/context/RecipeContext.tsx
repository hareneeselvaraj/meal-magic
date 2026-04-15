import { createContext, useContext, useState, type ReactNode } from 'react';
import { recipes as initialRecipes, type Recipe } from '@/data/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecipeContextValue {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Recipe;
  updateRecipe: (id: string, patch: Partial<Omit<Recipe, 'id'>>) => void;
  deleteRecipe: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const RecipeContext = createContext<RecipeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const addRecipe = (recipe: Omit<Recipe, 'id'>): Recipe => {
    const newRecipe: Recipe = { ...recipe, id: `r_${Date.now()}` };
    setRecipes((prev) => [newRecipe, ...prev]);
    return newRecipe;
  };

  const updateRecipe = (id: string, patch: Partial<Omit<Recipe, 'id'>>) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRecipes = () => {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used inside <RecipeProvider>');
  return ctx;
};
