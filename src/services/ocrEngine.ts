import { standardizeUnit } from "../lib/types";

// 1. TEXT NORMALIZATION
export function normalizeText(text: string): string {
  // Lowercase and remove anything that isn't a letter, number, or space
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

// 2. MASTER GROCERY DICTIONARY
export const masterGroceryDictionary = [
  { name: "milk", category: "Dairy", aliases: ["milk", "amul milk", "toned milk", "full cream milk", "cow milk"] },
  { name: "onion", category: "Vegetables", aliases: ["onion", "big onion", "red onion", "small onion"] },
  { name: "salt", category: "Masalas", aliases: ["salt", "tata salt", "crystal salt", "rock salt"] },
  { name: "sugar", category: "Pantry", aliases: ["sugar", "white sugar", "brown sugar", "cane sugar"] },
  { name: "rice", category: "Grains", aliases: ["rice", "basmati rice", "sona masoori", "raw rice", "boiled rice"] },
  { name: "dal", category: "Grains", aliases: ["dal", "toor dal", "moong dal", "urad dal", "chana dal"] },
  { name: "tomato", category: "Vegetables", aliases: ["tomato", "tomatoes", "country tomato"] },
  { name: "potato", category: "Vegetables", aliases: ["potato", "potatoes"] },
];

// 3. FUZZY SIMILARITY SCORE
export function similarityScore(a: string, b: string): number {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));

  let match = 0;
  setA.forEach(word => {
    if (setB.has(word)) match++;
  });

  return match / Math.max(setA.size, setB.size);
}

// 4. MAIN MATCHING ENGINE
export function matchItem(ocrItemName: string) {
  const cleaned = normalizeText(ocrItemName);

  let bestMatch = null;
  let bestScore = 0;
  let matchedCategory = "Uncategorized";

  masterGroceryDictionary.forEach(item => {
    item.aliases.forEach(alias => {
      const score = similarityScore(cleaned, normalizeText(alias));

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item.name;
        matchedCategory = item.category;
      }
    });
  });

  // Threshold of 0.5 for a solid match
  if (bestScore > 0.5 && bestMatch) {
    return { isFound: true, name: bestMatch, category: matchedCategory };
  }
  
  return { isFound: false, name: ocrItemName, category: "Uncategorized" };
}

// 5. EXTRACT QUANTITY & UNIT (Regex Parser)
export function parseQuantityAndUnit(rawText: string) {
  const normalized = rawText.toLowerCase();
  
  // Matches digits (including decimals) followed by an optional space, and then known units.
  const regex = /([\d.]+)\s*(kg|kgs|g|gram|grams|mg|l|liter|liters|ml|pc|pcs|pieces|count)/i;
  const match = normalized.match(regex);

  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: match[2]
    };
  }

  // Fallback if no unit found
  return { quantity: 1, unit: "count" }; 
}

// 6. PIPELINE ORCHESTRATOR
export function processRawOCR(rawItems: string[]) {
  const matched = [];
  const unmapped = [];

  for (const rawText of rawItems) {
    // Attempt to extract unit and quantity
    const { quantity, unit } = parseQuantityAndUnit(rawText);
    
    // Attempt to match the string against dictionary
    const matchResult = matchItem(rawText);

    if (matchResult.isFound) {
      // Standardize the units
      const structured = standardizeUnit(quantity, unit);
      
      matched.push({
        rawText,
        name: matchResult.name,
        category: matchResult.category,
        quantity: structured.quantity,
        unit: structured.unit
      });
    } else {
      unmapped.push(rawText);
    }
  }

  return { matched, unmapped };
}
