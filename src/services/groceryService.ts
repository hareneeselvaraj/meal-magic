import { db } from "../lib/firebase";
import { GroceryItem, standardizeUnit, getStatus } from "../lib/types";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp, 
  increment 
} from "firebase/firestore";

export const groceryService = {

  // 1. ADD / UPDATE GROCERY
  async addOrUpdateGroceryItem(userId: string, item: Omit<GroceryItem, 'id' | 'lastUpdated' | 'status'>) {
    const standardized = standardizeUnit(item.quantity, item.unit);
    const groceryRef = collection(db, "users", userId, "grocery");
    
    // Check if item exists by name (simplest approach, case-insensitive logic ideally)
    const q = query(groceryRef, where("name", "==", item.name));
    const qs = await getDocs(q);

    if (!qs.empty) {
      // Item exists, update it
      const docRef = qs.docs[0].ref;
      const existingData = qs.docs[0].data() as GroceryItem;
      
      const newQuantity = Math.max(0, existingData.quantity + standardized.quantity);
      const newStatus = getStatus(existingData.name, newQuantity, standardized.unit);

      await updateDoc(docRef, {
        quantity: newQuantity,
        status: newStatus,
        lastUpdated: Timestamp.now()
      });
      return docRef.id;
    } else {
      // Create new
      const newStatus = getStatus(item.name, standardized.quantity, standardized.unit);
      const newDocRef = doc(groceryRef);
      
      const newGroceryItem: GroceryItem = {
        name: item.name,
        category: item.category,
        quantity: standardized.quantity,
        unit: standardized.unit,
        status: newStatus,
        lastUpdated: Timestamp.now()
      };
      
      await setDoc(newDocRef, newGroceryItem);
      return newDocRef.id;
    }
  },

  // 4. CATEGORY FILTERING & 5. REAL-TIME UPDATES
  subscribeToGroceryInventory(userId: string, category: string | null, callback: (items: GroceryItem[]) => void) {
    let q = query(collection(db, "users", userId, "grocery"));
    
    if (category) {
      q = query(q, where("category", "==", category));
    }

    // Return the unsubscribe function
    return onSnapshot(q, (snapshot) => {
      const items: GroceryItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as GroceryItem);
      });
      callback(items);
    });
  }
};
