import type { Cuisine, Recipe, HealthTip, MealSlot, FlavorTag, HealthTag, RecipeIngredient, RecipeInstruction, NutritionInfo } from '@/lib/types';

// ═══════════════════════════════════════════════════════
//  DEFAULT CUISINES
// ═══════════════════════════════════════════════════════
export const defaultCuisines: Omit<Cuisine, 'createdAt' | 'updatedAt'>[] = [
  { id: 'indian', name: 'Indian', nameInTamil: 'இந்திய', emoji: '🇮🇳', isDefault: true, isActive: true, createdBy: 'system' },
  { id: 'chinese', name: 'Chinese', nameInTamil: 'சீன', emoji: '🇨🇳', isDefault: true, isActive: true, createdBy: 'system' },
  { id: 'italian', name: 'Italian', nameInTamil: 'இத்தாலிய', emoji: '🇮🇹', isDefault: true, isActive: true, createdBy: 'system' },
  { id: 'japanese', name: 'Japanese', nameInTamil: 'ஜப்பானிய', emoji: '🇯🇵', isDefault: true, isActive: true, createdBy: 'system' },
];

// Helper to build ingredients
const ing = (name: string, qty: string, unit: string, tamil: string = '', optional = false): RecipeIngredient => ({
  name, nameInTamil: tamil || name, quantity: qty, unit, isOptional: optional
});

// Helper to build instructions
const step = (n: number, text: string, tamil: string = '', dur: number | null = null): RecipeInstruction => ({
  stepNumber: n, text, textInTamil: tamil || text, durationMinutes: dur
});

const defaultNutrition: NutritionInfo = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, sodium: 0 };

// ═══════════════════════════════════════════════════════
//  RECIPES — Multi-cuisine, health-tagged
// ═══════════════════════════════════════════════════════
export const seedRecipes: Omit<Recipe, 'createdAt' | 'updatedAt'>[] = [
  // ──── INDIAN — MORNING JUICE ────
  {
    id: 'mj1', name: 'Beetroot Carrot Juice', nameInTamil: 'பீட்ரூட் கேரட் ஜூஸ்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'morning_juice',
    tags: ['Light', 'Vitamin Rich'], healthTags: ['pregnancy_safe', 'iron_boost'],
    prepTimeMinutes: 10, cookTimeMinutes: 0, servings: 1,
    ingredients: [
      ing('Beetroot', '1', 'medium', 'பீட்ரூட்'),
      ing('Carrot', '2', 'medium', 'கேரட்'),
      ing('Ginger', '1', 'inch', 'இஞ்சி'),
      ing('Lemon', '0.5', 'pcs', 'எலுமிச்சை'),
      ing('Honey', '1', 'tsp', 'தேன்', true),
    ],
    instructions: [
      step(1, 'Wash and peel beetroot and carrots.', 'பீட்ரூட் மற்றும் கேரட்டை கழுவி தோல் உரிக்கவும்.'),
      step(2, 'Cut into chunks and add to juicer with ginger.', 'துண்டுகளாக வெட்டி இஞ்சியுடன் ஜூஸரில் போடவும்.'),
      step(3, 'Add lemon juice and honey. Serve fresh.', 'எலுமிச்சை சாறு மற்றும் தேன் சேர்க்கவும்.'),
    ],
    nutritionPer100g: { calories: 45, protein: 1, carbs: 10, fat: 0, fiber: 2, iron: 0.8, sodium: 40 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'mj2', name: 'Turmeric Milk (Haldi Doodh)', nameInTamil: 'மஞ்சள் பால்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'morning_juice',
    tags: ['Sweet', 'Light'], healthTags: ['pregnancy_safe', 'calcium_rich'],
    prepTimeMinutes: 5, cookTimeMinutes: 5, servings: 1,
    ingredients: [
      ing('Milk', '200', 'ml', 'பால்'),
      ing('Turmeric Powder', '1', 'tsp', 'மஞ்சள் தூள்'),
      ing('Black Pepper', '1', 'pinch', 'மிளகு'),
      ing('Honey', '1', 'tbsp', 'தேன்'),
    ],
    instructions: [
      step(1, 'Warm milk on medium heat.', 'பாலை மிதமான தீயில் சூடாக்கவும்.'),
      step(2, 'Add turmeric and pepper. Stir well.', 'மஞ்சள் மற்றும் மிளகு சேர்க்கவும்.'),
      step(3, 'Add honey when slightly cooled. Serve warm.', 'சிறிது ஆறியதும் தேன் சேர்க்கவும்.'),
    ],
    nutritionPer100g: { calories: 65, protein: 3, carbs: 8, fat: 3, fiber: 0, iron: 0.3, sodium: 45 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── INDIAN — BREAKFAST ────
  {
    id: 'b1', name: 'Ragi Porridge', nameInTamil: 'ராகி கூழ்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'breakfast',
    tags: ['Sweet', 'Light'], healthTags: ['pregnancy_safe', 'calcium_rich', 'iron_boost'],
    prepTimeMinutes: 5, cookTimeMinutes: 10, servings: 1,
    ingredients: [
      ing('Ragi Flour', '50', 'g', 'ராகி மாவு'),
      ing('Milk', '200', 'ml', 'பால்'),
      ing('Jaggery', '30', 'g', 'வெல்லம்'),
      ing('Cardamom', '2', 'pcs', 'ஏலக்காய்'),
      ing('Cashews', '5', 'pcs', 'முந்திரி'),
    ],
    instructions: [
      step(1, 'Mix ragi flour with cold water to make smooth paste.', 'ராகி மாவை குளிர்ந்த நீரில் கரைக்கவும்.'),
      step(2, 'Boil milk, add ragi paste stirring continuously.', 'பாலை கொதிக்க வைத்து ராகி கரைசலை சேர்க்கவும்.', 5),
      step(3, 'Add jaggery and cardamom. Garnish with cashews.', 'வெல்லம் மற்றும் ஏலக்காய் சேர்க்கவும்.'),
    ],
    nutritionPer100g: { calories: 120, protein: 4, carbs: 22, fat: 3, fiber: 3, iron: 3.9, sodium: 25 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'b2', name: 'Oats Upma', nameInTamil: 'ஓட்ஸ் உப்புமா',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'breakfast',
    tags: ['Balanced', 'Light'], healthTags: ['heart_friendly', 'high_fiber'],
    prepTimeMinutes: 5, cookTimeMinutes: 12, servings: 2,
    ingredients: [
      ing('Oats', '100', 'g', 'ஓட்ஸ்'),
      ing('Onions', '50', 'g', 'வெங்காயம்'),
      ing('Mustard Seeds', '1', 'tsp', 'கடுகு'),
      ing('Curry Leaves', '5', 'pcs', 'கறிவேப்பிலை'),
      ing('Carrot', '30', 'g', 'கேரட்'),
      ing('Green Peas', '30', 'g', 'பட்டாணி'),
    ],
    instructions: [
      step(1, 'Dry roast oats 2 min. Set aside.', 'ஓட்ஸை வறுக்கவும்.', 2),
      step(2, 'Temper mustard seeds and curry leaves in oil.', 'கடுகு, கறிவேப்பிலை தாளிக்கவும்.'),
      step(3, 'Add veggies, sauté 3 min. Add water and oats.', 'காய்கறிகள் சேர்த்து ஓட்ஸ் சேர்க்கவும்.', 3),
      step(4, 'Cover and cook 3 min. Serve with lemon.', 'மூடி 3 நிமிடம் வேகவிடவும்.', 3),
    ],
    nutritionPer100g: { calories: 95, protein: 4, carbs: 16, fat: 2, fiber: 4, iron: 1.5, sodium: 30 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'b3', name: 'Poha', nameInTamil: 'அவல்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'breakfast',
    tags: ['Light'], healthTags: ['pregnancy_safe', 'iron_boost'],
    prepTimeMinutes: 5, cookTimeMinutes: 12, servings: 2,
    ingredients: [
      ing('Flattened Rice', '150', 'g', 'அவல்'), ing('Onions', '50', 'g', 'வெங்காயம்'),
      ing('Peanuts', '30', 'g', 'வேர்க்கடலை'), ing('Turmeric', '1', 'tsp', 'மஞ்சள்'),
      ing('Curry Leaves', '5', 'pcs', 'கறிவேப்பிலை'), ing('Lemon', '1', 'pcs', 'எலுமிச்சை'),
    ],
    instructions: [
      step(1, 'Rinse poha, drain. Add salt and turmeric.', 'அவலை கழுவி மஞ்சள் சேர்க்கவும்.'),
      step(2, 'Temper mustard seeds, curry leaves, peanuts.', 'கடுகு, கறிவேப்பிலை தாளிக்கவும்.'),
      step(3, 'Add onions, then poha. Toss gently.', 'வெங்காயம், அவல் சேர்க்கவும்.', 2),
      step(4, 'Squeeze lemon. Garnish with coriander.', 'எலுமிச்சை பிழியவும்.'),
    ],
    nutritionPer100g: { calories: 110, protein: 3, carbs: 20, fat: 2, fiber: 1, iron: 2.0, sodium: 20 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── INDIAN — LUNCH ────
  {
    id: 'l1', name: 'Millet Biryani', nameInTamil: 'தினை பிரியாணி',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'lunch',
    tags: ['Spicy', 'Balanced'], healthTags: ['heart_friendly', 'high_fiber'],
    prepTimeMinutes: 15, cookTimeMinutes: 30, servings: 3,
    ingredients: [
      ing('Foxtail Millet', '200', 'g', 'தினை'), ing('Mixed Vegetables', '150', 'g', 'கலப்பு காய்கறிகள்'),
      ing('Yogurt', '50', 'ml', 'தயிர்'), ing('Onions', '100', 'g', 'வெங்காயம்'),
      ing('Biryani Masala', '2', 'tsp', 'பிரியாணி மசாலா'), ing('Ghee', '1', 'tbsp', 'நெய்'),
      ing('Mint Leaves', '10', 'g', 'புதினா'), ing('Saffron', '1', 'pinch', 'குங்குமப்பூ'),
    ],
    instructions: [
      step(1, 'Soak millet 15 min. Drain.', 'தினையை 15 நிமிடம் ஊறவைக்கவும்.', 15),
      step(2, 'Fry onions in ghee until golden.', 'வெங்காயத்தை நெய்யில் பொரிக்கவும்.', 5),
      step(3, 'Add masala, yogurt, vegetables. Cook 5 min.', 'மசாலா, தயிர், காய்கறிகள் சேர்க்கவும்.', 5),
      step(4, 'Layer millet and veggie mix. Add saffron milk.', 'தினை மற்றும் காய்கறிகளை அடுக்கவும்.'),
      step(5, 'Cover, cook on low 15 min. Garnish with mint.', 'மூடி 15 நிமிடம் வேகவிடவும்.', 15),
    ],
    nutritionPer100g: { calories: 140, protein: 5, carbs: 24, fat: 3, fiber: 4, iron: 2.0, sodium: 50 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'l2', name: 'Rajma Chawal', nameInTamil: 'ராஜ்மா சாவல்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'lunch',
    tags: ['Spicy'], healthTags: ['pregnancy_safe', 'iron_boost', 'high_fiber'],
    prepTimeMinutes: 15, cookTimeMinutes: 35, servings: 3,
    ingredients: [
      ing('Kidney Beans', '150', 'g', 'ராஜ்மா'), ing('Basmati Rice', '200', 'g', 'பாஸ்மதி அரிசி'),
      ing('Onions', '80', 'g', 'வெங்காயம்'), ing('Tomatoes', '100', 'g', 'தக்காளி'),
      ing('Ginger-Garlic Paste', '1', 'tbsp', 'இஞ்சி-பூண்டு விழுது'), ing('Rajma Masala', '2', 'tsp', 'ராஜ்மா மசாலா'),
    ],
    instructions: [
      step(1, 'Soak rajma overnight. Pressure cook until soft.', 'ராஜ்மாவை இரவு முழுவதும் ஊறவைக்கவும்.', 25),
      step(2, 'Sauté onions, add ginger-garlic paste.', 'வெங்காயம் வதக்கி இஞ்சி-பூண்டு சேர்க்கவும்.'),
      step(3, 'Add tomatoes and masala. Simmer 10 min.', 'தக்காளி, மசாலா சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்.', 10),
      step(4, 'Add rajma. Cook rice separately. Serve together.', 'ராஜ்மா சேர்க்கவும். அரிசி தனியாக சமைக்கவும்.'),
    ],
    nutritionPer100g: { calories: 150, protein: 7, carbs: 25, fat: 2, fiber: 5, iron: 3.5, sodium: 40 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── INDIAN — SNACK ────
  {
    id: 's1', name: 'Dates & Nuts Ladoo', nameInTamil: 'பேரீச்சை லட்டு',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'snack',
    tags: ['Sweet', 'Iron Rich'], healthTags: ['pregnancy_safe', 'iron_boost'],
    prepTimeMinutes: 15, cookTimeMinutes: 0, servings: 8,
    ingredients: [
      ing('Dates', '150', 'g', 'பேரீச்சை'), ing('Almonds', '30', 'g', 'பாதாம்'),
      ing('Cashews', '20', 'g', 'முந்திரி'), ing('Coconut', '30', 'g', 'தேங்காய்'),
      ing('Cardamom', '2', 'pcs', 'ஏலக்காய்'),
    ],
    instructions: [
      step(1, 'Deseed dates. Pulse in blender until sticky.', 'பேரீச்சையை விதை நீக்கி அரைக்கவும்.'),
      step(2, 'Chop nuts, mix into date paste with cardamom.', 'பருப்புகளை நறுக்கி கலக்கவும்.'),
      step(3, 'Roll into balls. Coat with coconut.', 'உருண்டைகளாக உருட்டி தேங்காயில் புரட்டவும்.'),
    ],
    nutritionPer100g: { calories: 280, protein: 5, carbs: 45, fat: 10, fiber: 4, iron: 2.5, sodium: 10 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 's2', name: 'Roasted Makhana', nameInTamil: 'வறுத்த மக்கானா',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'snack',
    tags: ['Light'], healthTags: ['heart_friendly', 'low_sodium'],
    prepTimeMinutes: 2, cookTimeMinutes: 8, servings: 2,
    ingredients: [
      ing('Fox Nuts', '100', 'g', 'மக்கானா'), ing('Ghee', '1', 'tsp', 'நெய்'),
      ing('Black Pepper', '1', 'tsp', 'மிளகு'), ing('Rock Salt', '1', 'tsp', 'கல் உப்பு'),
    ],
    instructions: [
      step(1, 'Heat ghee in a pan on low flame.', 'நெய்யை சூடாக்கவும்.'),
      step(2, 'Roast makhana 5-7 min until crunchy.', 'மக்கானாவை வறுக்கவும்.', 7),
      step(3, 'Sprinkle pepper and salt. Cool before serving.', 'மிளகு, உப்பு தூவி பரிமாறவும்.'),
    ],
    nutritionPer100g: { calories: 350, protein: 10, carbs: 65, fat: 2, fiber: 5, iron: 1.4, sodium: 15 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── INDIAN — DINNER ────
  {
    id: 'd1', name: 'Palak Paneer + Roti', nameInTamil: 'பாலக் பன்னீர் + ரொட்டி',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'dinner',
    tags: ['Balanced', 'Iron Rich'], healthTags: ['pregnancy_safe', 'iron_boost', 'calcium_rich'],
    prepTimeMinutes: 10, cookTimeMinutes: 25, servings: 2,
    ingredients: [
      ing('Spinach', '250', 'g', 'கீரை'), ing('Paneer', '120', 'g', 'பன்னீர்'),
      ing('Wheat Flour', '150', 'g', 'கோதுமை மாவு'), ing('Onions', '60', 'g', 'வெங்காயம்'),
      ing('Garlic', '4', 'cloves', 'பூண்டு'), ing('Ghee', '1', 'tbsp', 'நெய்'),
      ing('Cumin Seeds', '1', 'tsp', 'சீரகம்'),
    ],
    instructions: [
      step(1, 'Blanch spinach 2 min. Blend to puree.', 'கீரையை வேகவைத்து அரைக்கவும்.', 2),
      step(2, 'Sauté cumin, garlic, onion in ghee.', 'சீரகம், பூண்டு, வெங்காயம் வதக்கவும்.', 3),
      step(3, 'Add puree and paneer cubes. Simmer 5 min.', 'கீரை விழுது, பன்னீர் சேர்க்கவும்.', 5),
      step(4, 'Knead flour into dough. Roll rotis, cook on tawa.', 'மாவு பிசைந்து ரொட்டி செய்யவும்.', 10),
    ],
    nutritionPer100g: { calories: 130, protein: 8, carbs: 10, fat: 7, fiber: 3, iron: 4.0, sodium: 35 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'd2', name: 'Idli + Sambar', nameInTamil: 'இட்லி + சாம்பார்',
    cuisineId: 'indian', cuisineName: 'Indian', mealSlot: 'dinner',
    tags: ['Light'], healthTags: ['heart_friendly', 'low_sodium'],
    prepTimeMinutes: 10, cookTimeMinutes: 20, servings: 2,
    ingredients: [
      ing('Idli Batter', '200', 'g', 'இட்லி மாவு'), ing('Toor Dal', '80', 'g', 'துவரம் பருப்பு'),
      ing('Drumstick', '1', 'pcs', 'முருங்கைக்காய்'), ing('Sambar Powder', '2', 'tsp', 'சாம்பார் பொடி'),
      ing('Tamarind', '10', 'g', 'புளி'), ing('Mustard Seeds', '1', 'tsp', 'கடுகு'),
    ],
    instructions: [
      step(1, 'Steam idli batter in greased moulds 12 min.', 'இட்லி மாவை ஆவியில் வேகவைக்கவும்.', 12),
      step(2, 'Cook toor dal. Mash well.', 'துவரம் பருப்பை வேகவைக்கவும்.', 10),
      step(3, 'Add drumstick, tamarind water, sambar powder.', 'முருங்கை, புளி, சாம்பார் பொடி சேர்க்கவும்.', 5),
      step(4, 'Temper with mustard seeds. Serve hot.', 'கடுகு தாளிக்கவும்.'),
    ],
    nutritionPer100g: { calories: 90, protein: 5, carbs: 15, fat: 1, fiber: 2, iron: 1.2, sodium: 25 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── CHINESE — Recipes ────
  {
    id: 'c_b1', name: 'Vegetable Fried Rice', nameInTamil: 'காய்கறி ஃப்ரைட் ரைஸ்',
    cuisineId: 'chinese', cuisineName: 'Chinese', mealSlot: 'lunch',
    tags: ['Balanced'], healthTags: ['heart_friendly'],
    prepTimeMinutes: 10, cookTimeMinutes: 15, servings: 2,
    ingredients: [
      ing('Cooked Rice', '300', 'g', 'சமைத்த அரிசி'), ing('Carrot', '50', 'g', 'கேரட்'),
      ing('Capsicum', '50', 'g', 'குடை மிளகாய்'), ing('Spring Onion', '30', 'g', 'வெங்காயத்தாள்'),
      ing('Soy Sauce', '2', 'tbsp', 'சோயா சாஸ்'), ing('Sesame Oil', '1', 'tsp', 'நல்லெண்ணெய்'),
    ],
    instructions: [
      step(1, 'Heat oil in a wok on high flame.', 'வாணலியில் எண்ணெய் சூடாக்கவும்.'),
      step(2, 'Stir-fry diced veggies 3 min.', 'காய்கறிகளை வதக்கவும்.', 3),
      step(3, 'Add cold rice, soy sauce. Toss well.', 'சாதம், சோயா சாஸ் சேர்க்கவும்.', 5),
      step(4, 'Finish with sesame oil and spring onions.', 'நல்லெண்ணெய், வெங்காயத்தாள் சேர்க்கவும்.'),
    ],
    nutritionPer100g: { calories: 130, protein: 3, carbs: 22, fat: 3, fiber: 1, iron: 0.8, sodium: 350 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'c_s1', name: 'Vegetable Manchurian', nameInTamil: 'காய்கறி மஞ்சூரியன்',
    cuisineId: 'chinese', cuisineName: 'Chinese', mealSlot: 'snack',
    tags: ['Spicy'], healthTags: [],
    prepTimeMinutes: 15, cookTimeMinutes: 15, servings: 3,
    ingredients: [
      ing('Cabbage', '200', 'g', 'முட்டைகோஸ்'), ing('Carrot', '50', 'g', 'கேரட்'),
      ing('Corn Flour', '50', 'g', 'சோள மாவு'), ing('Soy Sauce', '2', 'tbsp', 'சோயா சாஸ்'),
      ing('Chili Sauce', '1', 'tbsp', 'மிளகாய் சாஸ்'), ing('Garlic', '6', 'cloves', 'பூண்டு'),
    ],
    instructions: [
      step(1, 'Grate cabbage and carrot finely. Mix with corn flour.', 'முட்டைகோஸ் துருவி சோள மாவு சேர்க்கவும்.'),
      step(2, 'Shape into balls and deep fry until golden.', 'உருண்டைகளாக பொரிக்கவும்.', 8),
      step(3, 'Make sauce with garlic, soy sauce, chili sauce.', 'பூண்டு, சாஸ்களில் கிரேவி செய்யவும்.', 3),
      step(4, 'Toss fried balls in sauce. Serve hot.', 'பொரித்தவற்றை சாஸில் கிளறி பரிமாறவும்.'),
    ],
    nutritionPer100g: { calories: 180, protein: 3, carbs: 18, fat: 10, fiber: 2, iron: 0.5, sodium: 500 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── ITALIAN ────
  {
    id: 'it_l1', name: 'Penne Arrabbiata', nameInTamil: 'பென்னே அர்ரபியாட்டா',
    cuisineId: 'italian', cuisineName: 'Italian', mealSlot: 'lunch',
    tags: ['Spicy', 'Balanced'], healthTags: ['heart_friendly'],
    prepTimeMinutes: 10, cookTimeMinutes: 20, servings: 2,
    ingredients: [
      ing('Penne Pasta', '200', 'g', 'பென்னே பாஸ்தா'), ing('Tomatoes', '300', 'g', 'தக்காளி'),
      ing('Garlic', '4', 'cloves', 'பூண்டு'), ing('Olive Oil', '2', 'tbsp', 'ஆலிவ் எண்ணெய்'),
      ing('Red Chili Flakes', '1', 'tsp', 'மிளகாய் தூள்'), ing('Basil', '10', 'g', 'துளசி'),
    ],
    instructions: [
      step(1, 'Boil pasta in salted water until al dente. Drain.', 'பாஸ்தாவை உப்பு நீரில் வேகவைக்கவும்.', 10),
      step(2, 'Sauté garlic in olive oil. Add crushed tomatoes.', 'பூண்டு வதக்கி தக்காளி சேர்க்கவும்.', 3),
      step(3, 'Add chili flakes. Simmer 10 min.', 'மிளகாய் சேர்த்து 10 நிமிடம் கொதிக்கவிடவும்.', 10),
      step(4, 'Toss pasta in sauce. Garnish with basil.', 'பாஸ்தாவை சாஸில் கலக்கவும்.'),
    ],
    nutritionPer100g: { calories: 160, protein: 5, carbs: 28, fat: 4, fiber: 2, iron: 1.0, sodium: 200 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'it_d1', name: 'Minestrone Soup', nameInTamil: 'மினஸ்ட்ரோன் சூப்',
    cuisineId: 'italian', cuisineName: 'Italian', mealSlot: 'dinner',
    tags: ['Light', 'Balanced'], healthTags: ['heart_friendly', 'high_fiber', 'low_sodium'],
    prepTimeMinutes: 10, cookTimeMinutes: 25, servings: 3,
    ingredients: [
      ing('Kidney Beans', '100', 'g', 'ராஜ்மா'), ing('Zucchini', '100', 'g', 'சுரைக்காய்'),
      ing('Carrot', '80', 'g', 'கேரட்'), ing('Celery', '50', 'g', 'செலரி'),
      ing('Tomatoes', '200', 'g', 'தக்காளி'), ing('Olive Oil', '1', 'tbsp', 'ஆலிவ் எண்ணெய்'),
    ],
    instructions: [
      step(1, 'Sauté diced celery, carrot, zucchini in olive oil.', 'காய்கறிகளை எண்ணெயில் வதக்கவும்.', 5),
      step(2, 'Add crushed tomatoes and 4 cups water.', 'தக்காளி, நீர் சேர்க்கவும்.'),
      step(3, 'Add beans. Simmer 20 min.', 'பீன்ஸ் சேர்த்து 20 நிமிடம் கொதிக்கவிடவும்.', 20),
      step(4, 'Season with salt, pepper. Serve hot.', 'உப்பு, மிளகு சேர்த்து பரிமாறவும்.'),
    ],
    nutritionPer100g: { calories: 70, protein: 4, carbs: 12, fat: 1, fiber: 3, iron: 1.2, sodium: 100 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  // ──── JAPANESE ────
  {
    id: 'jp_b1', name: 'Miso Soup', nameInTamil: 'மிசோ சூப்',
    cuisineId: 'japanese', cuisineName: 'Japanese', mealSlot: 'morning_juice',
    tags: ['Light'], healthTags: ['heart_friendly', 'low_sodium'],
    prepTimeMinutes: 5, cookTimeMinutes: 10, servings: 2,
    ingredients: [
      ing('Miso Paste', '2', 'tbsp', 'மிசோ பேஸ்ட்'), ing('Tofu', '100', 'g', 'டோஃபு'),
      ing('Seaweed', '5', 'g', 'கடல்பாசி'), ing('Spring Onion', '20', 'g', 'வெங்காயத்தாள்'),
    ],
    instructions: [
      step(1, 'Boil 500ml water. Reduce heat.', 'நீரை கொதிக்கவிடவும்.'),
      step(2, 'Dissolve miso paste in warm water.', 'மிசோ பேஸ்ட்டை கரைக்கவும்.', 2),
      step(3, 'Add cubed tofu and seaweed.', 'டோஃபு, கடல்பாசி சேர்க்கவும்.', 3),
      step(4, 'Garnish with spring onion. Serve warm.', 'வெங்காயத்தாள் தூவி பரிமாறவும்.'),
    ],
    nutritionPer100g: { calories: 40, protein: 3, carbs: 4, fat: 1, fiber: 1, iron: 0.5, sodium: 300 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
  {
    id: 'jp_l1', name: 'Vegetable Sushi Roll', nameInTamil: 'காய்கறி சுஷி ரோல்',
    cuisineId: 'japanese', cuisineName: 'Japanese', mealSlot: 'lunch',
    tags: ['Light', 'Balanced'], healthTags: ['heart_friendly', 'low_sodium'],
    prepTimeMinutes: 20, cookTimeMinutes: 15, servings: 2,
    ingredients: [
      ing('Sushi Rice', '200', 'g', 'சுஷி அரிசி'), ing('Nori Sheets', '4', 'pcs', 'நோரி'),
      ing('Cucumber', '1', 'pcs', 'வெள்ளரி'), ing('Avocado', '1', 'pcs', 'அவகாடோ'),
      ing('Carrot', '1', 'pcs', 'கேரட்'), ing('Rice Vinegar', '2', 'tbsp', 'அரிசி வினிகர்'),
    ],
    instructions: [
      step(1, 'Cook sushi rice. Season with rice vinegar.', 'சுஷி அரிசி சமைத்து வினிகர் சேர்க்கவும்.', 15),
      step(2, 'Place nori on mat. Spread rice evenly.', 'நோரி மீது அரிசியை பரப்பவும்.'),
      step(3, 'Add julienned veggies in a line.', 'நீளமாக வெட்டிய காய்கறிகளை வைக்கவும்.'),
      step(4, 'Roll tightly. Cut into 8 pieces.', 'இறுக்கமாக சுற்றி 8 துண்டுகளாக வெட்டவும்.'),
    ],
    nutritionPer100g: { calories: 120, protein: 2, carbs: 25, fat: 2, fiber: 2, iron: 0.6, sodium: 150 },
    videoLinks: [], imageUrl: null, createdBy: 'system', isPublic: true,
  },
];

// ═══════════════════════════════════════════════════════
//  HEALTH TIPS
// ═══════════════════════════════════════════════════════
export const healthTips: HealthTip[] = [
  { id: 'ht1', text: 'Iron-rich foods like spinach and dates help prevent anemia during pregnancy.', textTamil: 'கீரை, பேரீச்சை போன்ற இரும்புச்சத்து உணவுகள் கர்ப்பகால ரத்தசோகையை தடுக்கும்.', forProfiles: ['pregnancy'], forDeficiencies: ['iron'], emoji: '🩸' },
  { id: 'ht2', text: 'Include ragi regularly — it\'s excellent for calcium and iron!', textTamil: 'ராகியை தொடர்ந்து சாப்பிடுங்கள் — கால்சியம் மற்றும் இரும்புச்சத்து நிறைந்தது!', forProfiles: ['pregnancy'], forDeficiencies: ['calcium'], emoji: '🦴' },
  { id: 'ht3', text: 'Reduce sodium intake to keep blood pressure in check.', textTamil: 'உப்பு அளவை குறைத்து இரத்த அழுத்தத்தை கட்டுப்படுத்துங்கள்.', forProfiles: ['heart_health'], forDeficiencies: [], emoji: '❤️' },
  { id: 'ht4', text: 'Oats and millets are heart-friendly whole grains.', textTamil: 'ஓட்ஸ் மற்றும் சிறுதானியங்கள் இதய நலத்திற்கு நல்லது.', forProfiles: ['heart_health'], forDeficiencies: [], emoji: '🌾' },
  { id: 'ht5', text: 'Stay hydrated! Aim for 8-10 glasses of water daily.', textTamil: 'நீர்ச்சத்து பெறுங்கள்! தினமும் 8-10 கிளாஸ் நீர் குடியுங்கள்.', forProfiles: ['pregnancy', 'heart_health'], forDeficiencies: [], emoji: '💧' },
  { id: 'ht6', text: 'Vitamin B12 is essential — include dairy and fortified foods.', textTamil: 'வைட்டமின் B12 அவசியம் — பால் பொருட்கள் சேர்க்கவும்.', forProfiles: ['pregnancy'], forDeficiencies: ['b12'], emoji: '🥛' },
];
