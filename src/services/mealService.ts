import { db } from "../lib/firebase";
import { Meal, MealLog, standardizeUnit, getStatus, GroceryItem } from "../lib/types";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";

export const mealService = {

  // Create a meal / save a recipe
  async saveRecipe(userId: string, meal: Omit<Meal, 'id'>) {
    const mealRef = doc(collection(db, "users", userId, "meals"));
    await setDoc(mealRef, meal);
    return mealRef.id;
  },

  // Get all meals/recipes
  async getMeals(userId: string) {
    const snapshot = await getDocs(collection(db, "users", userId, "meals"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
  },

  // 2. AUTO-DEDUCT INGREDIENTS (WHEN USER COOKS)
  async logMealAndDeductIngredients(userId: string, mealId: string) {
    // Fetch meal details to get ingredients
    const mealRef = doc(db, "users", userId, "meals", mealId);
    const mealSnap = await getDocs(query(collection(db, "users", userId, "meals"), where("__name__", "==", mealId)));
    
    if (mealSnap.empty) throw new Error("Meal not found");
    const meal = mealSnap.docs[0].data() as Meal;

    const groceryRef = collection(db, "users", userId, "grocery");
    let actualIngredientsUsed = [];

    // Loop through ingredients and subtract quantity
    for (const ingredient of meal.ingredients) {
      const required = standardizeUnit(ingredient.quantity, ingredient.unit);
      
      const q = query(groceryRef, where("name", "==", ingredient.name));
      const qs = await getDocs(q);

      if (!qs.empty) {
        const inventoryDoc = qs.docs[0];
        const inventoryItem = inventoryDoc.data() as GroceryItem;

        // Prevent negative quantities
        let newQuantity = inventoryItem.quantity - required.quantity;
        newQuantity = Math.max(0, newQuantity);

        const newStatus = getStatus(inventoryItem.name, newQuantity, inventoryItem.unit);

        await updateDoc(inventoryDoc.ref, {
          quantity: newQuantity,
          status: newStatus,
          lastUpdated: Timestamp.now()
        });

        actualIngredientsUsed.push({
          name: ingredient.name,
          quantity: required.quantity,
          unit: required.unit
        });
      }
    }

    // Log the meal
    const logRef = doc(collection(db, "users", userId, "mealLogs"));
    const newLog: Omit<MealLog, 'id'> = {
      date: Timestamp.now(),
      meals: [mealId],
      ingredientsUsed: actualIngredientsUsed
    };

    await setDoc(logRef, newLog);
    return logRef.id;
  }
};
