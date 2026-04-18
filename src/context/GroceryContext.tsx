import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { readAll, writeAll } from '@/lib/db';
import {
  groceryItems as initialItems,
  groceryCategories as initialCategories,
  type GroceryItemData,
  type GroceryCategory,
} from '@/data/mockData';
import type { BillRecord } from '@/lib/spendTracker';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IngredientCheck {
  ingredientName: string;
  recipeName: string;
  requiredQty: string;
  requiredUnit: string;
  availableQty: number;
  availableUnit: string;
  status: 'available' | 'low' | 'missing';
}

interface GroceryContextValue {
  // Items CRUD
  items: GroceryItemData[];
  addItem: (item: Omit<GroceryItemData, 'id'>) => void;
  updateItem: (id: string, patch: Partial<Omit<GroceryItemData, 'id'>>) => void;
  deleteItem: (id: string) => void;

  // Categories CRUD
  categories: GroceryCategory[];
  addCategory: (category: Omit<GroceryCategory, 'id'>) => void;
  updateCategory: (id: string, patch: Partial<Omit<GroceryCategory, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  // Bulk operations
  bulkAddItems: (items: Omit<GroceryItemData, 'id'>[]) => void;

  // Track spending
  billHistory: BillRecord[];
  addBill: (bill: Omit<BillRecord, 'id'>) => void;

  // Grocery Intelligence
  deductIngredients: (ingredients: { name: string; quantity: string; unit: string }[]) => void;
  checkIngredientAvailability: (
    recipeName: string,
    ingredients: { name: string; quantity: string; unit: string }[]
  ) => IngredientCheck[];
}

// ─── Fuzzy name matching ─────────────────────────────────────────────────────
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '') // remove parenthetical (sliced), (chopped)
    .replace(/\s+/g, ' ')
    .trim();
}

function findMatchingGroceryItem(items: GroceryItemData[], ingredientName: string): GroceryItemData | null {
  const normalized = normalizeIngredientName(ingredientName);

  // Exact match
  let match = items.find(it => normalizeIngredientName(it.name) === normalized);
  if (match) return match;

  // Partial match — ingredient contains grocery name or vice versa
  match = items.find(it => {
    const gName = normalizeIngredientName(it.name);
    return normalized.includes(gName) || gName.includes(normalized);
  });
  if (match) return match;

  // Word overlap match
  const words = normalized.split(' ').filter(w => w.length > 2);
  match = items.find(it => {
    const gName = normalizeIngredientName(it.name);
    return words.some(w => gName.includes(w));
  });
  return match || null;
}

function parseQuantity(qty: string): number {
  const num = parseFloat(qty);
  return isNaN(num) ? 0 : num;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const GroceryContext = createContext<GroceryContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export const GroceryProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<GroceryItemData[]>(() => loadJSON('nm_groceryItems', initialItems));
  const [categories, setCategories] = useState<GroceryCategory[]>(() => loadJSON('nm_groceryCategories', initialCategories));
  const [billHistory, setBillHistory] = useState<BillRecord[]>(() => loadJSON('nm_billHistory', []));
  const [loaded, setLoaded] = useState(true);

  // ── Auto-persist on change ──
  useEffect(() => { localStorage.setItem('nm_groceryItems', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('nm_groceryCategories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('nm_billHistory', JSON.stringify(billHistory)); }, [billHistory]);

  const deriveStatus = (qty: number): GroceryItemData['status'] => {
    if (qty <= 0) return 'missing';
    if (qty <= 0.5) return 'low';
    return 'available';
  };

  // ── Item operations ──────────────────────────────────────────────────────
  const addItem = (item: Omit<GroceryItemData, 'id'>) => {
    setItems((prev) => [
      { ...item, id: `g${Date.now()}`, status: deriveStatus(item.quantity) },
      ...prev,
    ]);
  };

  const updateItem = (id: string, patch: Partial<Omit<GroceryItemData, 'id'>>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        return { ...next, status: deriveStatus(next.quantity) };
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ── Category operations ──────────────────────────────────────────────────
  const addCategory = (category: Omit<GroceryCategory, 'id'>) => {
    setCategories((prev) => [
      ...prev,
      { ...category, id: `cat_${Date.now()}` },
    ]);
  };

  const updateCategory = (id: string, patch: Partial<Omit<GroceryCategory, 'id'>>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setItems((prev) => prev.filter((item) => item.category !== id));
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // ── Bulk add ─────────────────────────────────────────────────────────────
  const bulkAddItems = (newItems: Omit<GroceryItemData, 'id'>[]) => {
    setItems((prev) => [
      ...newItems.map((item, i) => ({
        ...item,
        id: `g${Date.now()}_${i}`,
        status: deriveStatus(item.quantity),
      })),
      ...prev,
    ]);
  };

  const addBill = (bill: Omit<BillRecord, 'id'>) => {
    setBillHistory((prev) => [{ ...bill, id: `bill_${Date.now()}` }, ...prev]);
  };

  // ── Grocery Intelligence ─────────────────────────────────────────────────

  /** Deduct recipe ingredients from grocery inventory */
  const deductIngredients = useCallback((ingredients: { name: string; quantity: string; unit: string }[]) => {
    setItems(prev => {
      const updated = [...prev];
      for (const ing of ingredients) {
        const match = findMatchingGroceryItem(updated, ing.name);
        if (match) {
          const idx = updated.findIndex(it => it.id === match.id);
          if (idx !== -1) {
            const deductAmt = parseQuantity(ing.quantity);
            const newQty = Math.max(0, updated[idx].quantity - deductAmt);
            updated[idx] = {
              ...updated[idx],
              quantity: newQty,
              status: newQty <= 0 ? 'missing' : newQty <= 0.5 ? 'low' : 'available',
            };
          }
        }
      }
      return updated;
    });
  }, []);

  /** Check ingredient availability against grocery inventory */
  const checkIngredientAvailability = useCallback((
    recipeName: string,
    ingredients: { name: string; quantity: string; unit: string }[]
  ): IngredientCheck[] => {
    const alerts: IngredientCheck[] = [];
    for (const ing of ingredients) {
      const match = findMatchingGroceryItem(items, ing.name);
      if (!match) {
        alerts.push({
          ingredientName: ing.name,
          recipeName,
          requiredQty: ing.quantity,
          requiredUnit: ing.unit,
          availableQty: 0,
          availableUnit: ing.unit,
          status: 'missing',
        });
      } else if (match.status === 'low' || match.status === 'missing') {
        alerts.push({
          ingredientName: ing.name,
          recipeName,
          requiredQty: ing.quantity,
          requiredUnit: ing.unit,
          availableQty: match.quantity,
          availableUnit: match.unit,
          status: match.status === 'missing' ? 'missing' : 'low',
        });
      }
    }
    return alerts;
  }, [items]);

  return (
    <GroceryContext.Provider
      value={{
        items, addItem, updateItem, deleteItem,
        categories, addCategory, updateCategory, deleteCategory,
        bulkAddItems,
        billHistory, addBill,
        deductIngredients, checkIngredientAvailability,
      }}
    >
      {loaded ? children : null}
    </GroceryContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGrocery = () => {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error('useGrocery must be used inside <GroceryProvider>');
  return ctx;
};
