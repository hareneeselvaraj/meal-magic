import { db } from "../lib/firebase";
import { Purchase, PurchaseItem, Upload } from "../lib/types";
import { groceryService } from "./groceryService";
import { processRawOCR } from "./ocrEngine";
import { 
  collection, 
  doc, 
  setDoc, 
  Timestamp 
} from "firebase/firestore";

export const purchaseService = {

  // PROCESS OCR INVOICE 
  // Changed arguments to take raw string array to utilize our new intelligence engine.
  async processMockOCRInvoice(userId: string, fileUrl: string, rawOcrTextArray: string[], source: string) {
    
    // Pass raw output through the text normalization, fuzzy matching, and unit extraction pipeline
    const { matched, unmapped } = processRawOCR(rawOcrTextArray);

    // 1. Create the Upload Document (Logging the structured metadata & unmapped failures)
    const uploadRef = doc(collection(db, "users", userId, "uploads"));
    const uploadData: Omit<Upload, 'id'> = {
      fileUrl,
      extractedItems: matched,
      status: unmapped.length > 0 ? "pending" : "processed" // If there are unmapped items, require user review later
    };
    await setDoc(uploadRef, uploadData);

    // 2. Add to Purchase History (only standard format items)
    const purchaseRef = doc(collection(db, "users", userId, "purchases"));
    // Convert matched items format to strict PurchaseItem format
    const purchaseItems = matched.map(m => ({ name: m.name, quantity: m.quantity, unit: m.unit }));

    const purchaseData: Omit<Purchase, 'id'> = {
      date: Timestamp.now(),
      source,
      items: purchaseItems
    };
    await setDoc(purchaseRef, purchaseData);

    // 3. Update Grocery Inventory automatically mapped by AI dictionary
    for (const item of matched) {
      await groceryService.addOrUpdateGroceryItem(userId, {
        name: item.name,
        category: item.category, // Auto-supplied by Dictionary mapping
        quantity: item.quantity,
        unit: item.unit
      });
    }

    // Return the breakdown so UI can ask the user what to do with `unmapped` objects
    return {
      purchaseId: purchaseRef.id,
      matched,
      unmapped
    };
  }
};
