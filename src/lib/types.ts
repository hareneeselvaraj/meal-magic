

// ═══════════════════════════════════════════════════════
//  MEAL PLANNER PWA — Complete Type System
// ═══════════════════════════════════════════════════════

// ── User Profiles ────────────────────────────────────────
export type Language = 'en' | 'ta';
export type ProfileType = 'pregnancy' | 'heart_health';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profileType: ProfileType;
  weight: number;       // kg
  height: number;       // cm
  age: number;
  deficiencies: string[];  // ['iron', 'vitamin_d', 'ferritin', 'b12']
  preferredLanguage: Language;
  preferredCuisines: string[];
  spiceLevel: 'mild' | 'medium' | 'spicy';
  isVegetarian: boolean;
  avatarUrl?: string;
  createdAt: Date | number;
  updatedAt: Date | number;
}

// ── Cuisine Management ────────────────────────────────────
export interface Cuisine {
  id: string;
  name: string;
  nameInTamil: string;
  emoji: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;  // userId or 'system'
  createdAt: Date | number;
  updatedAt: Date | number;
}

// ── Recipe System ─────────────────────────────────────────
export type MealSlot = 'morning_juice' | 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type FlavorTag = 'Spicy' | 'Sweet' | 'Light' | 'Balanced' | 'Iron Rich' | 'Vitamin Rich';
export type HealthTag = 'pregnancy_safe' | 'heart_friendly' | 'iron_boost' | 'calcium_rich' | 'low_sodium' | 'high_fiber' | 'folate_rich';

export interface RecipeIngredient {
  name: string;
  nameInTamil: string;
  quantity: string;
  unit: string;
  isOptional: boolean;
}

export interface RecipeInstruction {
  stepNumber: number;
  text: string;
  textInTamil: string;
  durationMinutes: number | null;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  sodium: number;
}

export interface VideoLink {
  url: string;
  platform: 'youtube' | 'instagram';
  originalLanguage: Language;
  transcriptEnglish: string;
  transcriptTamil: string;
  addedAt: Date | number;
}

export interface Recipe {
  id: string;
  name: string;
  nameInTamil: string;
  cuisineId: string;
  cuisineName?: string;
  mealSlot: MealSlot;
  tags: FlavorTag[];
  healthTags: HealthTag[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutritionPer100g: NutritionInfo;
  videoLinks: VideoLink[];
  imageUrl: string | null;
  createdBy: string;
  isPublic: boolean;
  isFavourite?: boolean;
  createdAt: Date | number;
  updatedAt: Date | number;
}

// ── Meal Planning ─────────────────────────────────────────
export interface MealPlanMeals {
  morning_juice: string | null;  // recipeId
  breakfast: string | null;
  lunch: string | null;
  snack: string | null;
  dinner: string | null;
}

export interface MealPlanServings {
  morning_juice: number;
  breakfast: number;
  lunch: number;
  snack: number;
  dinner: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  meals: MealPlanMeals;
  servingsPerSlot: MealPlanServings;
  completedMeals: MealSlot[];
  notes: string | null;
  createdAt: Date | number;
}

// ── Meal Slot Configuration ─────────────────────────────
export interface MealSlotConfig {
  key: MealSlot;
  label: string;
  labelTamil: string;
  emoji: string;
  time: string;
}

export const MEAL_SLOT_CONFIG: MealSlotConfig[] = [
  { key: 'morning_juice', label: 'Morning Juice/Soup', labelTamil: 'காலை ஜூஸ்', emoji: '🥤', time: '6-7 AM' },
  { key: 'breakfast', label: 'Light Breakfast', labelTamil: 'காலை உணவு', emoji: '🍳', time: '8-9 AM' },
  { key: 'lunch', label: 'Lunch', labelTamil: 'மதிய உணவு', emoji: '🍛', time: '12:30-1:30 PM' },
  { key: 'snack', label: 'Evening Snack', labelTamil: 'மாலை சிற்றுண்டி', emoji: '🥗', time: '4-5 PM' },
  { key: 'dinner', label: 'Dinner', labelTamil: 'இரவு உணவு', emoji: '🍲', time: '7:30-8:30 PM' },
];

// ── Health Tips ──────────────────────────────────────────
export interface HealthTip {
  id: string;
  text: string;
  textTamil: string;
  forDeficiencies: string[];
  emoji: string;
}

// ── Grocery (Legacy compat) ──────────────────────────────
export interface GroceryItemData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'available' | 'low' | 'missing';
  category: string;
}

export interface GroceryCategory {
  id: string;
  name: string;
  iconUrl: string;
}

// ── Legacy Firestore Types (used by services) ────────────
export interface UserData {
  name: string;
  createdAt: Date | number;
}

export interface GroceryItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "available" | "low" | "out";
  lastUpdated: Date | number;
}

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Meal {
  id?: string;
  name: string;
  type: "breakfast" | "lunch" | "snack" | "dinner";
  tags: string[];
  ingredients: MealIngredient[];
  instructions?: string[];
  prepTimeMinutes?: number;
  imageUrl?: string;
}

export interface MealLog {
  id?: string;
  date: Date | number;
  meals: string[];
  ingredientsUsed: MealIngredient[];
}

export interface PurchaseItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Purchase {
  id?: string;
  date: Date | number;
  source: "BB Now" | "Manual" | string;
  items: PurchaseItem[];
}

export interface Upload {
  id?: string;
  fileUrl: string;
  extractedItems: any[];
  status: "processed" | "pending";
}

// ── Utility Functions ────────────────────────────────────
export function standardizeUnit(quantity: number, unit: string): { quantity: number, unit: string } {
  const normalizedUnit = unit.toLowerCase().trim();
  switch (normalizedUnit) {
    case "kg": case "kgs": case "kilogram":
      return { quantity: quantity * 1000, unit: "g" };
    case "mg": case "milligram":
      return { quantity: quantity / 1000, unit: "g" };
    case "g": case "gram": case "grams":
      return { quantity, unit: "g" };
    case "l": case "liter": case "liters":
      return { quantity: quantity * 1000, unit: "ml" };
    case "ml": case "milliliter":
      return { quantity, unit: "ml" };
    case "pc": case "pcs": case "pieces": case "count": case "whole": case "egg": case "eggs":
      return { quantity, unit: "count" };
    case "onion": case "onions":
      return { quantity: quantity * 150, unit: "g" };
    case "tomato": case "tomatoes":
      return { quantity: quantity * 125, unit: "g" };
    case "potato": case "potatoes":
      return { quantity: quantity * 150, unit: "g" };
    default:
      return { quantity, unit: normalizedUnit };
  }
}

export function fromStandardUnit(valueInStandard: number, targetUnit: string): number {
  const t = targetUnit.toLowerCase().trim();
  if (t === "kg" || t === "kgs") return valueInStandard / 1000;
  if (t === "g" || t === "grams") return valueInStandard;
  if (t === "mg" || t === "milligrams") return valueInStandard * 1000;
  if (t === "l" || t === "liters") return valueInStandard / 1000;
  if (t === "ml" || t === "milliliters") return valueInStandard;
  return valueInStandard;
}

export function smartDisplay(quantity: number, standardUnit: string): { value: number | string, unit: string } {
  if (standardUnit === "g") {
    if (quantity >= 1000) return { value: Number((quantity / 1000).toFixed(2)), unit: "kg" };
    return { value: Number(quantity.toFixed(1)), unit: "g" };
  }
  if (standardUnit === "ml") {
    if (quantity >= 1000) return { value: Number((quantity / 1000).toFixed(2)), unit: "L" };
    return { value: Number(quantity.toFixed(1)), unit: "ml" };
  }
  return { value: quantity, unit: standardUnit };
}

export function getStatus(name: string, quantity: number, unit: string): "available" | "low" | "out" {
  if (quantity <= 0) return "out";
  let lowThreshold = 0;
  if (unit === 'g' || unit === 'ml') lowThreshold = 200;
  else if (unit === 'count') lowThreshold = 3;
  return quantity <= lowThreshold ? "low" : "available";
}
