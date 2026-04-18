/**
 * Bill Parser Utility
 * Extracts grocery items from OCR/PDF text and auto-categorizes them.
 * 
 * Handles BigBasket, JioMart, and similar Indian grocery invoice formats.
 */
import { extractWithAI } from './aiFetcher';

export interface ParsedBillItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price?: number;
}

// ── Keyword → Category mapping ────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  vegetables: [
    'tomato', 'onion', 'potato', 'carrot', 'brinjal', 'capsicum', 'beans',
    'cabbage', 'cauliflower', 'spinach', 'palak', 'methi', 'coriander',
    'cucumber', 'beetroot', 'radish', 'peas', 'ladyfinger', 'bhindi',
    'drumstick', 'gourd', 'pumpkin', 'ginger', 'garlic', 'green chilli',
    'curry leaves', 'mint', 'dhaniya', 'pudina', 'lemon', 'lime',
    'broccoli', 'mushroom', 'lettuce', 'zucchini', 'bitter gourd',
  ],
  fruits: [
    'apple', 'banana', 'mango', 'grape', 'orange', 'papaya', 'watermelon',
    'pomegranate', 'guava', 'pineapple', 'chikoo', 'sapota', 'kiwi',
    'strawberry', 'fig', 'custard apple', 'mosambi', 'sweet lime',
  ],
  dairy: [
    'milk', 'curd', 'yogurt', 'paneer', 'cheese', 'butter', 'cream',
    'buttermilk', 'lassi', 'bread', 'pav', 'bun', 'dairy', 'dahi',
  ],
  meat: [
    'chicken', 'mutton', 'fish', 'prawn', 'shrimp', 'lamb',
    'pork', 'crab', 'lobster', 'squid', 'surmai', 'pomfret',
    'rohu', 'katla', 'rawas', 'seafood',
  ],
  rice: [
    'rice', 'basmati', 'atta', 'wheat', 'flour', 'maida', 'sooji',
    'rava', 'suji', 'besan', 'dal', 'toor', 'moong', 'chana', 'urad',
    'masoor', 'rajma', 'lobia', 'poha', 'semia', 'jowar', 'cholam',
    'ragi', 'bajra', 'millet', 'broken wheat', 'dalia', 'idli rava',
    'unpolished',
  ],
  masalas: [
    'masala', 'turmeric', 'haldi', 'red chilli', 'chilli powder',
    'coriander powder', 'cumin', 'jeera', 'garam masala', 'pepper',
    'mustard seed', 'fenugreek', 'ajwain', 'hing', 'asafoetida',
    'cardamom', 'elaichi', 'clove', 'cinnamon', 'bay leaf',
    'star anise', 'fennel', 'saunf', 'tamarind', 'sambhar', 'rasam',
    'chilli flake', 'black pepper',
  ],
  oils: [
    'sunflower oil', 'groundnut oil', 'mustard oil', 'coconut oil',
    'olive oil', 'sesame oil', 'gingelly', 'refined oil', 'ghee',
    'cooking oil', 'vanaspati',
  ],
  cereals: [
    'oats', 'cornflakes', 'muesli', 'cereal', 'chocos', 'granola',
  ],
  drinks: [
    'cola', 'pepsi', 'sprite', 'fanta', 'soda', 'juice', 'maaza',
    'frooti', 'limca', 'soft drink', 'tropicana',
  ],
  icecream: [
    'ice cream', 'icecream', 'kulfi', 'frozen dessert', 'gelato',
  ],
  chips: [
    'chips', 'namkeen', 'mixture', 'bhujia', 'kurkure', 'lays',
    'bingo', 'sev', 'murukku',
  ],
  choco: [
    'chocolate', 'cadbury', 'dairy milk', 'kitkat', 'snickers',
    'ferrero', '5star', 'perk',
  ],
  biscuits: [
    'biscuit', 'cookie', 'rusk', 'cake', 'marie', 'bourbon',
    'parle', 'britannia', 'dark fantasy', 'nutri choice',
  ],
  teacoffee: [
    'tea leaves', 'coffee', 'nescafe', 'bru', 'brook bond', 'green tea',
    'filter coffee', 'instant coffee', 'horlicks', 'bournvita',
    'complan', 'boost',
  ],
  sauces: [
    'sauce', 'ketchup', 'mayonnaise', 'jam', 'honey', 'peanut butter',
    'nutella', 'chutney', 'pickle', 'achar', 'vinegar', 'soy sauce',
    'spread', 'kissan',
  ],
  sweets: [
    'laddu', 'barfi', 'halwa', 'jalebi', 'rasgulla',
    'gulab jamun', 'kaju katli', 'mysore pak', 'peda', 'sugar',
    'jaggery', 'mishri',
  ],
  noodles: [
    'noodle', 'maggi', 'pasta', 'macaroni', 'spaghetti', 'penne',
    'yippee', 'cup noodle', 'top ramen',
  ],
  frozen: [
    'frozen', 'french fries', 'nugget', 'paratha', 'samosa',
    'spring roll', 'ready to eat', 'mccain',
  ],
  dryfruits: [
    'almond', 'badam', 'cashew', 'kaju', 'raisin', 'kishmish',
    'walnut', 'akhrot', 'pistachio', 'pista', 'dates', 'khajoor',
    'anjeer', 'dry fruit', 'seed mix', 'flax seed', 'chia seed',
  ],
  paan: [
    'paan', 'supari', 'mouth freshener', 'mukhwas',
  ],
};

/**
 * Determine which category an item name belongs to synchronously.
 */
export function categorizeItemSync(name: string): string {
  const lower = name.toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return catId;
    }
  }
  return '';
}

/**
 * Legacy synchronous categorizer with default fallback.
 */
export function categorizeItem(name: string): string {
  return categorizeItemSync(name) || 'rice';
}

/**
 * Smart categorizer: uses keywords first, then falls back to Gemini API.
 */
export async function categorizeItemSmart(name: string): Promise<string> {
  const match = categorizeItemSync(name);
  if (match) return match;

  try {
    const prompt = `Categorize this grocery item for an Indian household: "${name}". Return ONLY ONE of the following precise words: vegetables, fruits, dairy, meat, rice, masalas, oils, cereals, drinks, icecream, chips, choco, biscuits, teacoffee, sauces, sweets, noodles, frozen, dryfruits, paan, other. Return nothing else.`;
    const res = await extractWithAI(prompt);
    const cat = res.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (Object.keys(CATEGORY_KEYWORDS).includes(cat)) {
      return cat;
    }
    return 'rice'; // Fallback
  } catch (e) {
    console.error('AI Category fallback failed:', e);
    return 'rice'; // Absolute fallback
  }
}

/**
 * Parse a quantity + unit from text like "500 g", "2 kg", "200 g Pouch"
 */
function parseQtyUnit(text: string): { quantity: number; unit: string } {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|kgs|ml|ltr|l|lt|pcs|pc|pack|pkt)\b/i);
  if (!match) return { quantity: 1, unit: 'pcs' };
  const qty = parseFloat(match[1]) || 1;
  let unit = match[2].toLowerCase();
  if (['g', 'gm', 'gms'].includes(unit)) unit = 'g';
  else if (['kg', 'kgs'].includes(unit)) unit = 'kg';
  else if (['ml'].includes(unit)) unit = 'ml';
  else if (['ltr', 'l', 'lt'].includes(unit)) unit = 'L';
  else if (['pcs', 'pc'].includes(unit)) unit = 'pcs';
  else if (['pack', 'pkt'].includes(unit)) unit = 'pack';
  return { quantity: qty, unit };
}

/**
 * ── STRUCTURED INVOICE PARSER ─────────────────────────────────────────
 * BigBasket PDFs have a very specific pattern:
 *   [serial_number]
 *   [product name line 1]
 *   [product name line 2 with qty like "500 g"]
 *   [HSN code - 8 digit number]
 *   [quantity ordered]
 *   [price numbers...]
 *   [percentage values like "2.50%"]
 *   ...repeat
 * 
 * We detect serial numbers (1, 2, 3...) and collect the text lines
 * between them and the HSN code as the product description.
 */
export function parseBillText(ocrText: string): ParsedBillItem[] {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  
  console.log('[Parser] Total lines:', lines.length);

  // ── Strategy 1: Structured parsing (BigBasket / invoice table) ──
  const structuredItems = parseStructuredInvoice(lines);
  if (structuredItems.length > 0) {
    console.log('[Parser] Structured parse found', structuredItems.length, 'items');
    return structuredItems;
  }

  // ── Strategy 2: Keyword-based fallback (for less structured bills) ──
  console.log('[Parser] Falling back to keyword parsing');
  return parseKeywordBased(lines);
}

/**
 * Parse structured invoice tables (BigBasket format).
 * 
 * With sequential fragment output, the text looks like:
 *   "Item Description" ... header lines ...
 *   "1"                  ← serial number
 *   "bb Royal Organic Unpolished"  ← description line 1
 *   "Jowar / Sorghum Millet 500 g" ← description line 2
 *   "10081090"           ← HSN code (8 digits) = END of description
 *   "1"                  ← quantity ordered (NOT a serial!)
 *   "71.00"              ← price
 *   ...more numbers/percentages...
 *   "2"                  ← NEXT serial number
 *   "bb Popular Black Pepper -"
 *   "Whole 100 g Pouch"
 *   "09042229"           ← HSN code
 *   ...
 */
function parseStructuredInvoice(lines: string[]): ParsedBillItem[] {
  const items: ParsedBillItem[] = [];
  
  // Find where the item table starts (after "Item Description" header)
  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('item description')) {
      tableStart = i;
      break;
    }
  }
  if (tableStart === -1) return [];
  
  // Skip all remaining header fragments until we reach the first serial "1"
  let firstItemIdx = -1;
  for (let i = tableStart + 1; i < lines.length; i++) {
    if (lines[i] === '1') {
      firstItemIdx = i;
      break;
    }
  }
  if (firstItemIdx === -1) return [];
  
  let currentSerial = 0;
  let nameLines: string[] = [];
  let priceForCurrent: number | undefined;
  let waitingForNextSerial = false; // true = we passed HSN, skip numeric data
  
  for (let i = firstItemIdx; i < lines.length; i++) {
    const line = lines[i];
    
    // If we're past an HSN code, we're in the numeric data zone (qty, prices, %)
    // Keep skipping until we find the NEXT serial number
    if (waitingForNextSerial) {
      // Is this the next serial number?
      if (/^\d{1,2}$/.test(line) && parseInt(line) === currentSerial + 1) {
        // Save previous item
        if (nameLines.length > 0) {
          saveItem(items, nameLines, priceForCurrent);
        }
        currentSerial = parseInt(line);
        nameLines = [];
        priceForCurrent = undefined;
        waitingForNextSerial = false;
        continue;
      }
      
      // Otherwise grab the first price we see (for display)
      if (!priceForCurrent && /^\d+\.\d{2}$/.test(line)) {
        priceForCurrent = parseFloat(line);
      }
      
      // Skip everything else in the numeric zone
      continue;
    }
    
    // Check if this is a serial number (first one or sequential)
    if (/^\d{1,2}$/.test(line) && parseInt(line) === currentSerial + 1) {
      if (nameLines.length > 0) {
        saveItem(items, nameLines, priceForCurrent);
      }
      currentSerial = parseInt(line);
      nameLines = [];
      priceForCurrent = undefined;
      continue;
    }
    
    // HSN code = 8-digit number → end of description
    if (/^\d{7,8}$/.test(line)) {
      waitingForNextSerial = true;
      continue;
    }
    
    // Skip standalone numbers, prices, and percentages
    if (/^[\d.,\s]+$/.test(line)) continue;
    if (/^\d+\.\d+%$/.test(line)) continue;
    
    // Skip header words that might repeat
    if (/^(Rate|Amount|Value|Charges|Margin|Discount|CGST|SGST|UTGST|CESS|TOTAL|Gross|Taxable|Unit|Other|Price|No\.|Code|SI)/i.test(line)) continue;
    
    // This is a description line → collect it
    nameLines.push(line);
  }
  
  // Save the last item
  if (nameLines.length > 0) {
    saveItem(items, nameLines, priceForCurrent);
  }
  
  return items;
}

function saveItem(items: ParsedBillItem[], nameLines: string[], price?: number) {
  // Join multi-line description: "bb Royal Organic Unpolished" + "Jowar / Sorghum Millet 500 g"
  let fullDesc = nameLines.join(' ');
  
  // Extract qty/unit BEFORE cleaning (e.g. "500 g", "2 kg")
  const { quantity, unit } = parseQtyUnit(fullDesc);
  
  // Clean: only remove "bb" brand prefix and "Pouch" suffix
  let displayName = fullDesc
    .replace(/\b[bB]{2}\b\s*/g, '')                       // Remove "bb"
    .replace(/\b(Royal|Popular|Fresho|Select)\b\s*/gi, '') // Remove sub-brands
    .replace(/\s*Pouch\s*/gi, '')                          // Remove "Pouch"
    .replace(/\s*\d+\.\d+%/g, '')                          // Remove "2.50%"
    .replace(/\s*%\s*/g, '')                                // Remove stray %
    .replace(/\b\d{6,}\b/g, '')                             // Remove long numbers
    .replace(/\s{2,}/g, ' ')                                // Collapse whitespace
    .replace(/[-–]\s*$/, '')                                // Trailing dashes
    .trim();
  
  if (!displayName || displayName.length < 3) return;
  
  // Capitalize first letter of each word
  displayName = displayName.replace(/\b\w/g, c => c.toUpperCase());
  
  items.push({
    name: displayName,
    quantity,
    unit,
    category: categorizeItem(fullDesc),
    price,
  });
}

/**
 * Keyword-based fallback parser for unstructured text.
 */
function parseKeywordBased(lines: string[]): ParsedBillItem[] {
  const items: ParsedBillItem[] = [];
  const seen = new Set<string>();

  const REJECT_WORDS = [
    'invoice', 'bill', 'order', 'date', 'payment', 'wallet', 'rupee',
    'voucher', 'total', 'sub total', 'subtotal', 'gst', 'cgst', 'sgst',
    'tax', 'hsn', 'cess', 'discount', 'delivery', 'handling', 'charge',
    'saved', 'address', 'phone', 'mobile', 'email', 'gstin', 'fssai',
    'bigbasket', 'jiomart', 'zepto', 'blinkit', 'swiggy', 'instamart',
    'signature', 'signatory', 'terms', 'disclaimer', 'section',
    'nagar', 'road', 'street', 'chennai', 'bangalore', 'mumbai',
    'item description', 'quantity', 'unit price', 'taxable', 'amount',
  ];

  for (const line of lines) {
    if (line.length < 5) continue;
    if (/^[\d\s.\-:\/|,%]+$/.test(line)) continue;
    
    const lower = line.toLowerCase();
    if (REJECT_WORDS.some(rw => lower.includes(rw))) continue;

    // Only keep lines with a grocery keyword
    let category = '';
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) { category = catId; break; }
      }
      if (category) break;
    }
    if (!category) continue;

    let name = line
      .replace(/^\s*\d{1,3}[\.\)\s]+/, '')
      .replace(/\b[bB]{2}\b\s*/g, '')
      .replace(/\b(Royal|Popular|Fresho|Select)\b\s*/gi, '')
      .replace(/\b\d+(?:\.\d+)?\s*(g|gm|kg|ml|ltr|l|pcs|pack|pkt)\b/gi, '')
      .replace(/\d+\.\d+%/g, '')
      .replace(/%/g, '')
      .replace(/\b\d{4,}\b/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!name || name.length < 3) continue;
    name = name.replace(/\b\w/g, c => c.toUpperCase());

    const key = name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) continue;
    seen.add(key);

    const qtyMatch = line.match(/(\d+(?:\.\d+)?)\s*(g|gm|kg|ml|ltr|l|pcs|pack|pkt)\b/i);
    const { quantity, unit } = qtyMatch ? parseQtyUnit(qtyMatch[0]) : { quantity: 1, unit: 'pcs' };

    items.push({ name, quantity, unit, category });
  }

  return items;
}
