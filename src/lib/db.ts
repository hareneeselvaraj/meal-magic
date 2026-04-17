import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { GroceryItemData, GroceryCategory } from '@/data/mockData';

interface MealPlannerDB extends DBSchema {
  groceryItems:      { key: string; value: GroceryItemData };
  groceryCategories: { key: string; value: GroceryCategory };
  mealPlans:         { key: string; value: any };
  settings:          { key: string; value: any };
}

let dbPromise: Promise<IDBPDatabase<MealPlannerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MealPlannerDB>('mealplanner', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('groceryItems'))      db.createObjectStore('groceryItems',      { keyPath: 'id' });
        if (!db.objectStoreNames.contains('groceryCategories')) db.createObjectStore('groceryCategories', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('mealPlans'))         db.createObjectStore('mealPlans',         { keyPath: 'date' });
        if (!db.objectStoreNames.contains('settings'))          db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

type StoreName = 'groceryItems' | 'groceryCategories' | 'mealPlans' | 'settings';

export async function readAll<K extends StoreName>(store: K): Promise<MealPlannerDB[K]['value'][]> {
  const db = await getDB();
  return db.getAll(store);
}

export async function writeAll<K extends StoreName>(store: K, values: MealPlannerDB[K]['value'][]) {
  const db = await getDB();
  const tx = db.transaction(store, 'readwrite');
  await tx.objectStore(store).clear();
  await Promise.all(values.map(v => tx.objectStore(store).put(v)));
  await tx.done;
}
