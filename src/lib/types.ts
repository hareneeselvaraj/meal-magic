import { Timestamp } from "firebase/firestore";

// 1. USERS COLLECTION
export interface UserData {
  name: string;
  createdAt: Timestamp;
}

// 2. GROCERY INVENTORY
export interface GroceryItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "available" | "low" | "out";
  lastUpdated: Timestamp;
}

// 3. MEALS COLLECTION
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
  // Recipe Builder Extensions
  instructions?: string[];
  prepTimeMinutes?: number;
  imageUrl?: string;
}

// 4. DAILY MEAL LOG
export interface MealLog {
  id?: string;
  date: Timestamp;
  meals: string[]; // array of mealIds
  ingredientsUsed: MealIngredient[];
}

// 5. PURCHASE HISTORY
export interface PurchaseItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Purchase {
  id?: string;
  date: Timestamp;
  source: "BB Now" | "Manual" | string;
  items: PurchaseItem[];
}

// 6. OCR UPLOADS
export interface Upload {
  id?: string;
  fileUrl: string;
  extractedItems: any[];
  status: "processed" | "pending";
}

// UTILS
export function standardizeUnit(quantity: number, unit: string): { quantity: number, unit: string } {
  const normalizedUnit = unit.toLowerCase().trim();
  
  switch (normalizedUnit) {
    // ---- WEIGHT (Standard: g) ----
    case "kg":
    case "kgs":
    case "kilogram":
      return { quantity: quantity * 1000, unit: "g" };
    case "mg":
    case "milligram":
      return { quantity: quantity / 1000, unit: "g" };
    case "g":
    case "gram":
    case "grams":
      return { quantity, unit: "g" };

    // ---- VOLUME (Standard: ml) ----
    case "l":
    case "liter":
    case "liters":
      return { quantity: quantity * 1000, unit: "ml" };
    case "ml":
    case "milliliter":
      return { quantity, unit: "ml" };

    // ---- COUNT (Standard: count) ----
    case "pc":
    case "pcs":
    case "pieces":
    case "count":
    case "whole":
    case "egg":
    case "eggs":
      return { quantity, unit: "count" };

    // ---- APPROXIMATIONS ----
    case "onion":
    case "onions":
      // Approx: 1 medium onion = 150g
      return { quantity: quantity * 150, unit: "g" };
    case "tomato":
    case "tomatoes":
      // Approx: 1 medium tomato = 125g
      return { quantity: quantity * 125, unit: "g" };
    case "potato":
    case "potatoes":
      // Approx: 1 medium potato = 150g
      return { quantity: quantity * 150, unit: "g" };
      
    default:
      // Fallback
      return { quantity, unit: normalizedUnit };
  }
}

// Convert from standard unit to target custom unit (like g -> kg)
export function fromStandardUnit(valueInStandard: number, targetUnit: string): number {
  const normalizedTarget = targetUnit.toLowerCase().trim();

  // Weight
  if (normalizedTarget === "kg" || normalizedTarget === "kgs") return valueInStandard / 1000;
  if (normalizedTarget === "g" || normalizedTarget === "grams") return valueInStandard;
  if (normalizedTarget === "mg" || normalizedTarget === "milligrams") return valueInStandard * 1000;

  // Volume
  if (normalizedTarget === "l" || normalizedTarget === "liters") return valueInStandard / 1000;
  if (normalizedTarget === "ml" || normalizedTarget === "milliliters") return valueInStandard;

  return valueInStandard; // For counts or unknowns
}

// Smart Auto-Display (BEST UX) -> 1200g becomes "1.2 kg"
export function smartDisplay(quantity: number, standardUnit: string): { value: number | string, unit: string } {
  if (standardUnit === "g") {
    if (quantity >= 1000) {
      return { value: Number((quantity / 1000).toFixed(2)), unit: "kg" };
    }
    return { value: Number(quantity.toFixed(1)), unit: "g" };
  }
  
  if (standardUnit === "ml") {
    if (quantity >= 1000) {
      return { value: Number((quantity / 1000).toFixed(2)), unit: "L" };
    }
    return { value: Number(quantity.toFixed(1)), unit: "ml" };
  }

  // Count/Pieces or others
  return { value: quantity, unit: standardUnit };
}

// Thresholds for status calculation (standardized to g/ml/count)
export function getStatus(name: string, quantity: number, unit: string): "available" | "low" | "out" {
  if (quantity <= 0) return "out";
  
  let lowThreshold = 0;
  if (unit === 'g' || unit === 'ml') {
    lowThreshold = 200; // e.g., low if <= 200g or 200ml
  } else if (unit === 'count') {
    lowThreshold = 3; // e.g., low if <= 3 count
  }
  
  return quantity <= lowThreshold ? "low" : "available";
}
