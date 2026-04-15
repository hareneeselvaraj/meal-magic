import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  groceryItems as initialItems,
  groceryCategories as initialCategories,
  type GroceryItemData,
  type GroceryCategory,
} from '@/data/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

// ─── Context ─────────────────────────────────────────────────────────────────

const GroceryContext = createContext<GroceryContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const GroceryProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<GroceryItemData[]>(initialItems);
  const [categories, setCategories] = useState<GroceryCategory[]>(initialCategories);

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
    // Also remove all items belonging to this category
    setItems((prev) => prev.filter((item) => item.category !== id));
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  return (
    <GroceryContext.Provider
      value={{
        items, addItem, updateItem, deleteItem,
        categories, addCategory, updateCategory, deleteCategory,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGrocery = () => {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error('useGrocery must be used inside <GroceryProvider>');
  return ctx;
};
