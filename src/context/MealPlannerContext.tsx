import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Cuisine, Recipe, MealPlan, MealSlot, MealPlanServings, UserProfile, MealPlanMeals } from '@/lib/types';
import { seedRecipes, defaultCuisines } from '@/data/seedData';

// ─── Types ───────────────────────────────────────────────
interface MealPlannerContextValue {
  // User Profile
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  
  // Cuisines CRUD
  cuisines: Cuisine[];
  addCuisine: (cuisine: Omit<Cuisine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCuisine: (id: string, patch: Partial<Cuisine>) => void;
  deleteCuisine: (id: string) => void;
  
  // Recipes CRUD
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipesByCuisine: (cuisineId: string) => Recipe[];
  getRecipesBySlot: (slot: MealSlot) => Recipe[];
  
  // Meal Plans
  mealPlans: Record<string, MealPlan>; // keyed by date string
  setMealForSlot: (date: string, slot: MealSlot, recipeId: string | null) => void;
  setServingsForSlot: (date: string, slot: MealSlot, servings: number) => void;
  getServingsForSlot: (date: string, slot: MealSlot) => number;
  toggleMealComplete: (date: string, slot: MealSlot) => void;
  getMealPlan: (date: string) => MealPlan | null;
}

// ─── Default Profile ─────────────────────────────────────
const defaultProfile: UserProfile = {
  id: 'user_1',
  email: 'harenee@mealmagic.app',
  displayName: 'Harenee',
  profileType: 'pregnancy',
  weight: 60,
  height: 162,
  age: 25,
  deficiencies: ['iron', 'vitamin_d'],
  preferredLanguage: 'en',
  preferredCuisines: [],
  spiceLevel: 'medium',
  isVegetarian: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Initialize cuisines from seed
const initialCuisines: Cuisine[] = defaultCuisines.map(c => ({
  ...c,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Initialize recipes from seed
const initialRecipes: Recipe[] = seedRecipes.map(r => ({
  ...r,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// ─── Context ─────────────────────────────────────────────
const MealPlannerContext = createContext<MealPlannerContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────
// ── LocalStorage helpers ─────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export const MealPlannerProvider = ({ children }: { children: ReactNode }) => {
  const [activeProfile, setActiveProfile] = useState<UserProfile>(() => loadJSON('nm_profile', defaultProfile));
  const [cuisines, setCuisines] = useState<Cuisine[]>(() => loadJSON('nm_cuisines', initialCuisines));
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadJSON('nm_recipes', initialRecipes));
  const [mealPlans, setMealPlans] = useState<Record<string, MealPlan>>(() => loadJSON('nm_mealPlans', {}));

  // ── Auto-persist on change ──
  useEffect(() => { localStorage.setItem('nm_profile', JSON.stringify(activeProfile)); }, [activeProfile]);
  useEffect(() => { localStorage.setItem('nm_cuisines', JSON.stringify(cuisines)); }, [cuisines]);
  useEffect(() => { localStorage.setItem('nm_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nm_mealPlans', JSON.stringify(mealPlans)); }, [mealPlans]);

  // ── Cuisine Operations ────────────────────────────────
  const addCuisine = useCallback((cuisine: Omit<Cuisine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCuisine: Cuisine = {
      ...cuisine,
      id: `cuisine_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCuisines(prev => [...prev, newCuisine]);
  }, []);

  const updateCuisine = useCallback((id: string, patch: Partial<Cuisine>) => {
    setCuisines(prev =>
      prev.map(c => c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c)
    );
  }, []);

  const deleteCuisine = useCallback((id: string) => {
    setCuisines(prev =>
      prev.map(c => c.id === id ? { ...c, isActive: false, updatedAt: new Date() } : c)
    );
  }, []);

  // ── Recipe Operations ─────────────────────────────────
  const addRecipe = useCallback((recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Recipe => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRecipes(prev => [newRecipe, ...prev]);
    return newRecipe;
  }, []);

  const updateRecipe = useCallback((id: string, patch: Partial<Recipe>) => {
    setRecipes(prev =>
      prev.map(r => r.id === id ? { ...r, ...patch, updatedAt: new Date() } : r)
    );
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const getRecipesByCuisine = useCallback((cuisineId: string) => {
    return recipes.filter(r => r.cuisineId === cuisineId);
  }, [recipes]);

  const getRecipesBySlot = useCallback((slot: MealSlot) => {
    return recipes.filter(r => r.mealSlot === slot);
  }, [recipes]);

  // ── Default servings helper ────────────────────────────
  const DEFAULT_SERVINGS: MealPlanServings = { morning_juice: 1, breakfast: 1, lunch: 1, snack: 1, dinner: 1 };

  const ensurePlan = (prev: Record<string, MealPlan>, date: string): MealPlan =>
    prev[date] || {
      id: `mp_${date}`,
      userId: activeProfile.id,
      date,
      meals: { morning_juice: null, breakfast: null, lunch: null, snack: null, dinner: null },
      servingsPerSlot: { ...DEFAULT_SERVINGS },
      completedMeals: [],
      notes: null,
      createdAt: new Date(),
    };

  // ── Meal Plan Operations ──────────────────────────────
  const setMealForSlot = useCallback((date: string, slot: MealSlot, recipeId: string | null) => {
    setMealPlans(prev => {
      const existing = ensurePlan(prev, date);
      // Auto-set servings to recipe's default when assigning
      const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
      const newServings = recipe ? recipe.servings : 1;
      return {
        ...prev,
        [date]: {
          ...existing,
          meals: { ...existing.meals, [slot]: recipeId },
          servingsPerSlot: { ...existing.servingsPerSlot, [slot]: newServings },
        },
      };
    });
  }, [activeProfile.id, recipes]);

  const setServingsForSlot = useCallback((date: string, slot: MealSlot, servings: number) => {
    setMealPlans(prev => {
      const existing = ensurePlan(prev, date);
      return {
        ...prev,
        [date]: {
          ...existing,
          servingsPerSlot: { ...existing.servingsPerSlot, [slot]: Math.max(1, servings) },
        },
      };
    });
  }, [activeProfile.id]);

  const getServingsForSlot = useCallback((date: string, slot: MealSlot): number => {
    return mealPlans[date]?.servingsPerSlot?.[slot] ?? 1;
  }, [mealPlans]);

  const toggleMealComplete = useCallback((date: string, slot: MealSlot) => {
    setMealPlans(prev => {
      const existing = prev[date];
      if (!existing) return prev;
      const completed = existing.completedMeals.includes(slot)
        ? existing.completedMeals.filter(s => s !== slot)
        : [...existing.completedMeals, slot];
      return { ...prev, [date]: { ...existing, completedMeals: completed } };
    });
  }, []);

  const getMealPlan = useCallback((date: string) => {
    return mealPlans[date] || null;
  }, [mealPlans]);

  return (
    <MealPlannerContext.Provider value={{
      activeProfile, setActiveProfile,
      cuisines, addCuisine, updateCuisine, deleteCuisine,
      recipes, addRecipe, updateRecipe, deleteRecipe, getRecipesByCuisine, getRecipesBySlot,
      mealPlans, setMealForSlot, setServingsForSlot, getServingsForSlot, toggleMealComplete, getMealPlan,
    }}>
      {children}
    </MealPlannerContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────
export const useMealPlanner = () => {
  const ctx = useContext(MealPlannerContext);
  if (!ctx) throw new Error('useMealPlanner must be used inside <MealPlannerProvider>');
  return ctx;
};
