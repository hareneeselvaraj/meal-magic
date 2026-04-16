import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Cuisine, Recipe, MealPlan, MealSlot, UserProfile, MealPlanMeals } from '@/lib/types';
import { seedRecipes, defaultCuisines } from '@/data/seedData';

// ─── Types ───────────────────────────────────────────────
interface NutriMomContextValue {
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
const NutriMomContext = createContext<NutriMomContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────
// ── LocalStorage helpers ─────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export const NutriMomProvider = ({ children }: { children: ReactNode }) => {
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

  // ── Meal Plan Operations ──────────────────────────────
  const setMealForSlot = useCallback((date: string, slot: MealSlot, recipeId: string | null) => {
    setMealPlans(prev => {
      const existing = prev[date] || {
        id: `mp_${date}`,
        userId: activeProfile.id,
        date,
        meals: { morning_juice: null, breakfast: null, lunch: null, snack: null, dinner: null },
        completedMeals: [],
        notes: null,
        createdAt: new Date(),
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          meals: { ...existing.meals, [slot]: recipeId },
        },
      };
    });
  }, [activeProfile.id]);

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
    <NutriMomContext.Provider value={{
      activeProfile, setActiveProfile,
      cuisines, addCuisine, updateCuisine, deleteCuisine,
      recipes, addRecipe, updateRecipe, deleteRecipe, getRecipesByCuisine, getRecipesBySlot,
      mealPlans, setMealForSlot, toggleMealComplete, getMealPlan,
    }}>
      {children}
    </NutriMomContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────
export const useNutriMom = () => {
  const ctx = useContext(NutriMomContext);
  if (!ctx) throw new Error('useNutriMom must be used inside <NutriMomProvider>');
  return ctx;
};
