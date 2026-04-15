export type FlavorTag = 'Spicy' | 'Sweet' | 'Light' | 'Balanced' | 'Iron Rich' | 'Vitamin Rich';
export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

// ─── Rich Recipe Interface ───
export interface Recipe {
  id: string;
  name: string;
  mealSlot: MealSlot;
  tags: FlavorTag[];
  ingredients: { name: string; qty: string }[];
  instructions: string[];
  prepTimeMinutes: number;
  image?: string;
}

export interface GroceryItemData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'available' | 'low' | 'missing';
  category: string;
}

export interface GroceryCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface HistoryEntry {
  date: string;
  items: { name: string; quantity: string; change: string }[];
}

// ─── Legacy compat ───
export interface Meal {
  id: string;
  name: string;
  tags: FlavorTag[];
  ingredients: string[];
  image?: string;
}

// ════════════════════════════════════════════
//  30+ REAL HEALTHY INDIAN RECIPES
// ════════════════════════════════════════════

export const recipes: Recipe[] = [
  // ──── BREAKFAST (Salads, Grains, Eggs, Sandwiches) ────
  {
    id: 'b1', name: 'Egg Bhurji Toast', mealSlot: 'breakfast', tags: ['Spicy'],
    prepTimeMinutes: 10,
    ingredients: [
      { name: 'Eggs', qty: '2 pcs' }, { name: 'Onions', qty: '50 g' },
      { name: 'Tomatoes', qty: '50 g' }, { name: 'Green Chilies', qty: '2 pcs' },
      { name: 'Whole Wheat Bread', qty: '2 slices' }, { name: 'Turmeric Powder', qty: '1 pinch' },
      { name: 'Butter', qty: '10 g' },
    ],
    instructions: [
      'Heat butter in a pan, sauté chopped onions and green chilies.',
      'Add diced tomatoes and turmeric, cook 2 min.',
      'Crack eggs in, scramble on medium heat until cooked.',
      'Toast bread slices, serve bhurji on top with coriander.',
    ],
  },
  {
    id: 'b2', name: 'Sprouted Moong Salad', mealSlot: 'breakfast', tags: ['Light'],
    prepTimeMinutes: 8,
    ingredients: [
      { name: 'Moong Sprouts', qty: '150 g' }, { name: 'Cucumber', qty: '50 g' },
      { name: 'Tomatoes', qty: '50 g' }, { name: 'Lemon', qty: '1 pcs' },
      { name: 'Coriander Leaves', qty: '10 g' }, { name: 'Chaat Masala', qty: '1 tsp' },
    ],
    instructions: [
      'Toss moong sprouts with diced cucumber and tomatoes.',
      'Squeeze lemon juice, sprinkle chaat masala and salt.',
      'Garnish with fresh coriander. Serve cold.',
    ],
  },
  {
    id: 'b3', name: 'Oats Upma', mealSlot: 'breakfast', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 12,
    ingredients: [
      { name: 'Oats', qty: '100 g' }, { name: 'Onions', qty: '50 g' },
      { name: 'Mustard Seeds', qty: '1 tsp' }, { name: 'Curry Leaves', qty: '5 pcs' },
      { name: 'Carrot', qty: '30 g' }, { name: 'Green Peas', qty: '30 g' },
      { name: 'Green Chilies', qty: '1 pcs' },
    ],
    instructions: [
      'Dry roast oats for 2 min on medium heat. Set aside.',
      'Temper mustard seeds and curry leaves in oil.',
      'Add chopped onions, carrot, peas and chili. Sauté 3 min.',
      'Add water (1.5 cups), salt. Bring to boil. Add oats, mix well.',
      'Cover and cook 3 min on low. Serve hot with lemon.',
    ],
  },
  {
    id: 'b4', name: 'Paneer Veggie Sandwich', mealSlot: 'breakfast', tags: ['Balanced'],
    prepTimeMinutes: 10,
    ingredients: [
      { name: 'Whole Wheat Bread', qty: '4 slices' }, { name: 'Paneer', qty: '80 g' },
      { name: 'Cucumber', qty: '30 g' }, { name: 'Tomatoes', qty: '30 g' },
      { name: 'Mint Chutney', qty: '2 tbsp' }, { name: 'Butter', qty: '10 g' },
    ],
    instructions: [
      'Spread mint chutney on bread slices.',
      'Layer sliced paneer, cucumber, and tomato.',
      'Grill or toast on a tawa with a little butter.',
      'Cut diagonally and serve hot.',
    ],
  },
  {
    id: 'b5', name: 'Masala Omelette', mealSlot: 'breakfast', tags: ['Spicy'],
    prepTimeMinutes: 8,
    ingredients: [
      { name: 'Eggs', qty: '3 pcs' }, { name: 'Onions', qty: '40 g' },
      { name: 'Green Chilies', qty: '2 pcs' }, { name: 'Coriander Leaves', qty: '10 g' },
      { name: 'Turmeric Powder', qty: '1 pinch' }, { name: 'Oil', qty: '1 tbsp' },
    ],
    instructions: [
      'Beat eggs with turmeric, salt, chopped onion, chili, coriander.',
      'Heat oil in a flat pan on medium.',
      'Pour egg mixture, spread evenly. Cook 2 min each side.',
      'Serve with toast or paratha.',
    ],
  },
  {
    id: 'b6', name: 'Ragi Porridge (Sweet)', mealSlot: 'breakfast', tags: ['Sweet', 'Light'],
    prepTimeMinutes: 10,
    ingredients: [
      { name: 'Ragi Flour', qty: '50 g' }, { name: 'Milk', qty: '200 ml' },
      { name: 'Jaggery', qty: '30 g' }, { name: 'Cardamom', qty: '2 pcs' },
      { name: 'Cashews', qty: '5 pcs' },
    ],
    instructions: [
      'Mix ragi flour with half cup cold water to make a smooth paste.',
      'Boil milk, add ragi paste while stirring continuously.',
      'Cook 5 min on low. Add crushed jaggery and cardamom.',
      'Garnish with roasted cashews. Serve warm.',
    ],
  },
  {
    id: 'b7', name: 'Poha', mealSlot: 'breakfast', tags: ['Light'],
    prepTimeMinutes: 12,
    ingredients: [
      { name: 'Flattened Rice', qty: '150 g' }, { name: 'Onions', qty: '50 g' },
      { name: 'Peanuts', qty: '30 g' }, { name: 'Turmeric Powder', qty: '1 tsp' },
      { name: 'Curry Leaves', qty: '5 pcs' }, { name: 'Mustard Seeds', qty: '1 tsp' },
      { name: 'Lemon', qty: '1 pcs' },
    ],
    instructions: [
      'Rinse poha in water, drain. Add salt and turmeric, set aside.',
      'Temper mustard seeds, curry leaves and peanuts in oil.',
      'Add chopped onions, sauté until translucent.',
      'Add poha, toss gently. Cook 2 min.',
      'Squeeze lemon, garnish with coriander and sev.',
    ],
  },

  // ──── LUNCH (Millets, Grains, Biryanis) ────
  {
    id: 'l1', name: 'Millet Biryani', mealSlot: 'lunch', tags: ['Spicy', 'Balanced'],
    prepTimeMinutes: 30,
    ingredients: [
      { name: 'Foxtail Millet', qty: '200 g' }, { name: 'Mixed Vegetables', qty: '150 g' },
      { name: 'Yogurt', qty: '50 ml' }, { name: 'Onions', qty: '100 g' },
      { name: 'Biryani Masala', qty: '2 tsp' }, { name: 'Ghee', qty: '1 tbsp' },
      { name: 'Mint Leaves', qty: '10 g' }, { name: 'Saffron', qty: '1 pinch' },
    ],
    instructions: [
      'Soak millet in water 15 min. Drain.',
      'Fry sliced onions in ghee until golden. Set half aside.',
      'Add biryani masala, yogurt, and vegetables. Cook 5 min.',
      'Layer millet and veggie mixture. Add saffron milk.',
      'Cover tight, cook on low 15 min. Garnish with fried onions and mint.',
    ],
  },
  {
    id: 'l2', name: 'Ragi Dosa + Chutney', mealSlot: 'lunch', tags: ['Light'],
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'Ragi Flour', qty: '100 g' }, { name: 'Rice Flour', qty: '50 g' },
      { name: 'Onions', qty: '30 g' }, { name: 'Cumin Seeds', qty: '1 tsp' },
      { name: 'Grated Coconut', qty: '50 g' }, { name: 'Green Chilies', qty: '2 pcs' },
    ],
    instructions: [
      'Mix ragi flour, rice flour, chopped onion, cumin and salt with water into a batter.',
      'Pour on a hot tawa, spread thin. Drizzle oil.',
      'Cook until crispy on both sides.',
      'Blend coconut, green chili, and salt for chutney. Serve together.',
    ],
  },
  {
    id: 'l3', name: 'Jowar Roti + Dal Fry', mealSlot: 'lunch', tags: ['Balanced'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Jowar Flour', qty: '150 g' }, { name: 'Toor Dal', qty: '100 g' },
      { name: 'Onions', qty: '50 g' }, { name: 'Tomatoes', qty: '50 g' },
      { name: 'Garlic', qty: '4 cloves' }, { name: 'Cumin Seeds', qty: '1 tsp' },
      { name: 'Ghee', qty: '1 tbsp' }, { name: 'Turmeric Powder', qty: '1 tsp' },
    ],
    instructions: [
      'Pressure cook toor dal with turmeric (3 whistles).',
      'For tadka: heat ghee, add cumin, garlic, onions, tomatoes. Cook 5 min.',
      'Add cooked dal, simmer 5 min. Season with salt and coriander.',
      'Knead jowar flour with hot water. Pat into rotis, cook on tawa.',
    ],
  },
  {
    id: 'l4', name: 'Quinoa Pulao', mealSlot: 'lunch', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'Quinoa', qty: '150 g' }, { name: 'Mixed Vegetables', qty: '100 g' },
      { name: 'Bay Leaf', qty: '1 pcs' }, { name: 'Cumin Seeds', qty: '1 tsp' },
      { name: 'Ghee', qty: '1 tbsp' }, { name: 'Coriander Leaves', qty: '10 g' },
    ],
    instructions: [
      'Rinse quinoa well under cold water.',
      'Heat ghee, temper cumin and bay leaf.',
      'Add vegetables, sauté 3 min. Add quinoa and 2 cups water.',
      'Cover, cook on low 15 min until water is absorbed.',
      'Fluff with fork, garnish with coriander.',
    ],
  },
  {
    id: 'l5', name: 'Rajma Chawal', mealSlot: 'lunch', tags: ['Spicy'],
    prepTimeMinutes: 35,
    ingredients: [
      { name: 'Kidney Beans', qty: '150 g' }, { name: 'Basmati Rice', qty: '200 g' },
      { name: 'Onions', qty: '80 g' }, { name: 'Tomatoes', qty: '100 g' },
      { name: 'Ginger-Garlic Paste', qty: '1 tbsp' }, { name: 'Rajma Masala', qty: '2 tsp' },
      { name: 'Oil', qty: '2 tbsp' },
    ],
    instructions: [
      'Soak rajma overnight. Pressure cook until soft (6-7 whistles).',
      'Sauté onions, add ginger-garlic paste. Cook 2 min.',
      'Add tomato puree and rajma masala. Simmer 10 min.',
      'Add cooked rajma with its water. Simmer 15 min on low.',
      'Cook basmati rice separately. Serve rajma over rice.',
    ],
  },
  {
    id: 'l6', name: 'Vegetable Khichdi', mealSlot: 'lunch', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'Basmati Rice', qty: '100 g' }, { name: 'Moong Dal', qty: '80 g' },
      { name: 'Mixed Vegetables', qty: '100 g' }, { name: 'Ghee', qty: '1 tbsp' },
      { name: 'Cumin Seeds', qty: '1 tsp' }, { name: 'Turmeric Powder', qty: '1 tsp' },
    ],
    instructions: [
      'Wash rice and dal together. Soak 10 min.',
      'Heat ghee, temper cumin. Add chopped vegetables.',
      'Add rice, dal, turmeric, salt, and 3 cups water.',
      'Pressure cook 3 whistles. Serve with ghee and pickle.',
    ],
  },
  {
    id: 'l7', name: 'Curd Rice (Thayir Sadam)', mealSlot: 'lunch', tags: ['Light'],
    prepTimeMinutes: 15,
    ingredients: [
      { name: 'Basmati Rice', qty: '150 g' }, { name: 'Yogurt', qty: '200 ml' },
      { name: 'Mustard Seeds', qty: '1 tsp' }, { name: 'Curry Leaves', qty: '5 pcs' },
      { name: 'Green Chilies', qty: '1 pcs' }, { name: 'Pomegranate', qty: '30 g' },
    ],
    instructions: [
      'Cook rice until very soft. Cool completely.',
      'Mash rice, mix in yogurt and milk. Season with salt.',
      'Temper mustard seeds, curry leaves, chili in oil. Pour over rice.',
      'Garnish with pomegranate. Serve chilled.',
    ],
  },

  // ──── SNACKS (Healthy) ────
  {
    id: 's1', name: 'Roasted Makhana', mealSlot: 'snack', tags: ['Light'],
    prepTimeMinutes: 8,
    ingredients: [
      { name: 'Fox Nuts (Makhana)', qty: '100 g' }, { name: 'Ghee', qty: '1 tsp' },
      { name: 'Black Pepper', qty: '1 tsp' }, { name: 'Rock Salt', qty: '1 tsp' },
    ],
    instructions: [
      'Heat ghee in a pan on low flame.',
      'Add makhana, roast 5-7 min stirring continuously until crunchy.',
      'Sprinkle pepper and salt. Cool before serving.',
    ],
  },
  {
    id: 's2', name: 'Dates & Nuts Ladoo', mealSlot: 'snack', tags: ['Sweet'],
    prepTimeMinutes: 15,
    ingredients: [
      { name: 'Dates', qty: '150 g' }, { name: 'Almonds', qty: '30 g' },
      { name: 'Cashews', qty: '20 g' }, { name: 'Desiccated Coconut', qty: '30 g' },
      { name: 'Cardamom', qty: '2 pcs' },
    ],
    instructions: [
      'Deseed dates. Pulse in a blender until sticky.',
      'Chop almonds and cashews finely. Mix into date paste.',
      'Add crushed cardamom. Roll into small balls.',
      'Roll in desiccated coconut. Refrigerate 30 min.',
    ],
  },
  {
    id: 's3', name: 'Fruit Chaat Bowl', mealSlot: 'snack', tags: ['Sweet', 'Light'],
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'Banana', qty: '1 pcs' }, { name: 'Apple', qty: '1 pcs' },
      { name: 'Pomegranate', qty: '50 g' }, { name: 'Chaat Masala', qty: '1 tsp' },
      { name: 'Lemon', qty: '1 pcs' }, { name: 'Honey', qty: '1 tbsp' },
    ],
    instructions: [
      'Dice banana and apple. Add pomegranate seeds.',
      'Squeeze lemon, drizzle honey, sprinkle chaat masala.',
      'Toss well. Serve immediately.',
    ],
  },
  {
    id: 's4', name: 'Roasted Chana Mix', mealSlot: 'snack', tags: ['Spicy'],
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'Roasted Chana', qty: '100 g' }, { name: 'Onions', qty: '30 g' },
      { name: 'Tomatoes', qty: '30 g' }, { name: 'Lemon', qty: '1 pcs' },
      { name: 'Red Chili Powder', qty: '1 tsp' },
    ],
    instructions: [
      'Mix roasted chana with finely chopped onion and tomato.',
      'Add red chili powder, salt, and lemon juice.',
      'Toss and serve as a crunchy protein-rich snack.',
    ],
  },
  {
    id: 's5', name: 'Mango Lassi', mealSlot: 'snack', tags: ['Sweet'],
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'Yogurt', qty: '200 ml' }, { name: 'Mango Pulp', qty: '100 g' },
      { name: 'Sugar', qty: '20 g' }, { name: 'Cardamom', qty: '1 pcs' },
    ],
    instructions: [
      'Blend yogurt, mango pulp, sugar, and cardamom until smooth.',
      'Pour into a glass. Serve chilled with a pinch of saffron.',
    ],
  },
  {
    id: 's6', name: 'Sprouts Sundal', mealSlot: 'snack', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 10,
    ingredients: [
      { name: 'Mixed Sprouts', qty: '150 g' }, { name: 'Grated Coconut', qty: '30 g' },
      { name: 'Mustard Seeds', qty: '1 tsp' }, { name: 'Curry Leaves', qty: '5 pcs' },
      { name: 'Green Chilies', qty: '1 pcs' },
    ],
    instructions: [
      'Steam or boil sprouts until tender (5 min).',
      'Temper mustard seeds, curry leaves, green chili in oil.',
      'Add sprouts and grated coconut. Toss with salt.',
      'Squeeze lemon and serve warm.',
    ],
  },

  // ──── DINNER (Light, Dosa & Chutney, Healthy) ────
  {
    id: 'd1', name: 'Masala Dosa + Coconut Chutney', mealSlot: 'dinner', tags: ['Spicy'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Dosa Batter', qty: '200 g' }, { name: 'Potato', qty: '150 g' },
      { name: 'Onions', qty: '50 g' }, { name: 'Mustard Seeds', qty: '1 tsp' },
      { name: 'Turmeric Powder', qty: '1 tsp' }, { name: 'Grated Coconut', qty: '80 g' },
      { name: 'Green Chilies', qty: '2 pcs' }, { name: 'Oil', qty: '2 tbsp' },
    ],
    instructions: [
      'Boil potatoes, mash coarsely.',
      'Temper mustard seeds, add onions and turmeric. Add potato, season.',
      'Pour dosa batter on hot tawa, spread thin.',
      'Add potato filling, fold. Serve crispy.',
      'Blend coconut, green chili, and salt for chutney.',
    ],
  },
  {
    id: 'd2', name: 'Idli + Sambar', mealSlot: 'dinner', tags: ['Light'],
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'Idli Batter', qty: '200 g' }, { name: 'Toor Dal', qty: '80 g' },
      { name: 'Drumstick', qty: '1 pcs' }, { name: 'Sambar Powder', qty: '2 tsp' },
      { name: 'Tamarind', qty: '10 g' }, { name: 'Mustard Seeds', qty: '1 tsp' },
    ],
    instructions: [
      'Steam idli batter in greased moulds for 12 min.',
      'Cook toor dal (3 whistles). Mash well.',
      'Boil drumstick pieces. Add tamarind water and sambar powder.',
      'Mix in dal. Temper with mustard seeds. Simmer 5 min.',
    ],
  },
  {
    id: 'd3', name: 'Pesarattu (Green Moong Dosa)', mealSlot: 'dinner', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 15,
    ingredients: [
      { name: 'Green Moong Dal', qty: '150 g' }, { name: 'Rice Flour', qty: '30 g' },
      { name: 'Ginger', qty: '10 g' }, { name: 'Green Chilies', qty: '2 pcs' },
      { name: 'Cumin Seeds', qty: '1 tsp' }, { name: 'Oil', qty: '1 tbsp' },
    ],
    instructions: [
      'Soak moong dal 4 hours. Grind with ginger, chili, cumin into batter.',
      'Add rice flour and salt. Mix to dosa-batter consistency.',
      'Pour on hot tawa, spread thin circle. Drizzle oil.',
      'Cook until crispy. Serve with ginger chutney.',
    ],
  },
  {
    id: 'd4', name: 'Ragi Mudde + Saaru', mealSlot: 'dinner', tags: ['Light'],
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'Ragi Flour', qty: '100 g' }, { name: 'Toor Dal', qty: '50 g' },
      { name: 'Tomatoes', qty: '80 g' }, { name: 'Tamarind', qty: '10 g' },
      { name: 'Rasam Powder', qty: '2 tsp' }, { name: 'Ghee', qty: '1 tsp' },
    ],
    instructions: [
      'Boil water, slowly add ragi flour while stirring to avoid lumps.',
      'Cook on low 5 min. Shape into smooth balls (mudde).',
      'For saaru: boil dal, add tomato, tamarind water, rasam powder.',
      'Temper with ghee and mustard seeds. Serve mudde in saaru.',
    ],
  },
  {
    id: 'd5', name: 'Vegetable Uttapam', mealSlot: 'dinner', tags: ['Light', 'Balanced'],
    prepTimeMinutes: 15,
    ingredients: [
      { name: 'Dosa Batter', qty: '200 g' }, { name: 'Onions', qty: '50 g' },
      { name: 'Tomatoes', qty: '50 g' }, { name: 'Carrot', qty: '30 g' },
      { name: 'Green Chilies', qty: '1 pcs' }, { name: 'Oil', qty: '1 tbsp' },
    ],
    instructions: [
      'Pour thick dosa batter on hot tawa (don\'t spread thin).',
      'Top with chopped onion, tomato, carrot, chili.',
      'Press gently, drizzle oil. Cover and cook 3 min.',
      'Flip carefully, cook 2 more min. Serve with chutney.',
    ],
  },
  {
    id: 'd6', name: 'Dal Khichdi (Comfort Bowl)', mealSlot: 'dinner', tags: ['Light'],
    prepTimeMinutes: 18,
    ingredients: [
      { name: 'Basmati Rice', qty: '100 g' }, { name: 'Moong Dal', qty: '80 g' },
      { name: 'Ghee', qty: '1 tbsp' }, { name: 'Cumin Seeds', qty: '1 tsp' },
      { name: 'Turmeric Powder', qty: '1 tsp' }, { name: 'Ginger', qty: '10 g' },
    ],
    instructions: [
      'Wash rice and dal. Soak 10 min.',
      'Heat ghee, add cumin and grated ginger.',
      'Add rice, dal, turmeric, salt and 3.5 cups water.',
      'Pressure cook 3 whistles. Serve soft with ghee on top.',
    ],
  },
  {
    id: 'd7', name: 'Chapati + Palak Paneer', mealSlot: 'dinner', tags: ['Balanced'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Whole Wheat Flour', qty: '150 g' }, { name: 'Spinach', qty: '200 g' },
      { name: 'Paneer', qty: '100 g' }, { name: 'Onions', qty: '50 g' },
      { name: 'Garlic', qty: '3 cloves' }, { name: 'Cream', qty: '30 ml' },
      { name: 'Cumin Seeds', qty: '1 tsp' },
    ],
    instructions: [
      'Blanch spinach 2 min, blend into puree.',
      'Sauté cumin, onion, garlic. Add spinach puree.',
      'Add cubed paneer and cream. Simmer 5 min.',
      'Knead flour with water and salt. Roll into chapatis, cook on tawa.',
    ],
  },

  // ──── IRON RICH RECIPES ────
  {
    id: 'ir1', name: 'Spinach Moong Dal Soup', mealSlot: 'breakfast', tags: ['Iron Rich', 'Light'],
    prepTimeMinutes: 15,
    ingredients: [
      { name: 'Moong Dal', qty: '80 g' }, { name: 'Spinach', qty: '150 g' },
      { name: 'Garlic', qty: '3 cloves' }, { name: 'Cumin Seeds', qty: '1 tsp' },
      { name: 'Turmeric Powder', qty: '1 tsp' }, { name: 'Ghee', qty: '1 tsp' },
    ],
    instructions: [
      'Pressure cook moong dal with turmeric (2 whistles). Mash well.',
      'Heat ghee, add cumin and crushed garlic. Sauté 1 min.',
      'Add chopped spinach, cook 3 min.',
      'Mix in dal, add water to desired consistency. Simmer 5 min.',
      'Season with salt and lemon juice. Serve hot.',
    ],
  },
  {
    id: 'ir2', name: 'Rajma + Brown Rice Bowl', mealSlot: 'lunch', tags: ['Iron Rich', 'Balanced'],
    prepTimeMinutes: 35,
    ingredients: [
      { name: 'Kidney Beans', qty: '150 g' }, { name: 'Brown Rice', qty: '150 g' },
      { name: 'Onions', qty: '80 g' }, { name: 'Tomatoes', qty: '100 g' },
      { name: 'Ginger-Garlic Paste', qty: '1 tbsp' }, { name: 'Rajma Masala', qty: '2 tsp' },
      { name: 'Spinach', qty: '50 g' },
    ],
    instructions: [
      'Soak kidney beans overnight. Pressure cook 6 whistles.',
      'Cook brown rice separately with double water (25 min).',
      'Sauté onions, ginger-garlic paste, tomatoes. Add masala.',
      'Add rajma with liquid. Add chopped spinach. Simmer 10 min.',
      'Serve rajma gravy over brown rice.',
    ],
  },
  {
    id: 'ir3', name: 'Dates & Pumpkin Seeds Mix', mealSlot: 'snack', tags: ['Iron Rich', 'Sweet'],
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'Dates', qty: '80 g' }, { name: 'Pumpkin Seeds', qty: '30 g' },
      { name: 'Almonds', qty: '20 g' }, { name: 'Dark Chocolate', qty: '15 g' },
    ],
    instructions: [
      'Deseed dates and roughly chop.',
      'Combine with pumpkin seeds and almonds.',
      'Grate dark chocolate on top.',
      'Serve as an iron-rich trail mix snack.',
    ],
  },
  {
    id: 'ir4', name: 'Palak Paneer + Roti', mealSlot: 'dinner', tags: ['Iron Rich', 'Balanced'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Spinach', qty: '250 g' }, { name: 'Paneer', qty: '120 g' },
      { name: 'Whole Wheat Flour', qty: '150 g' }, { name: 'Onions', qty: '60 g' },
      { name: 'Garlic', qty: '4 cloves' }, { name: 'Ghee', qty: '1 tbsp' },
      { name: 'Cumin Seeds', qty: '1 tsp' },
    ],
    instructions: [
      'Blanch spinach 2 min. Blend to puree.',
      'Sauté cumin, garlic, onion in ghee.',
      'Add spinach puree and cubed paneer. Simmer 5 min.',
      'Knead wheat flour with water. Roll rotis, cook on tawa.',
      'Serve roti with palak paneer.',
    ],
  },

  // ──── VITAMIN RICH RECIPES ────
  {
    id: 'vr1', name: 'Carrot Ginger Smoothie Bowl', mealSlot: 'breakfast', tags: ['Vitamin Rich', 'Sweet'],
    prepTimeMinutes: 8,
    ingredients: [
      { name: 'Carrot', qty: '100 g' }, { name: 'Banana', qty: '1 pcs' },
      { name: 'Ginger', qty: '10 g' }, { name: 'Yogurt', qty: '100 ml' },
      { name: 'Honey', qty: '1 tbsp' }, { name: 'Apple', qty: '0.5 pcs' },
      { name: 'Pumpkin Seeds', qty: '15 g' },
    ],
    instructions: [
      'Blend carrot, banana, ginger, and yogurt until smooth.',
      'Pour into a bowl. Drizzle honey.',
      'Top with sliced apple and pumpkin seeds.',
      'Serve immediately for maximum vitamins.',
    ],
  },
  {
    id: 'vr2', name: 'Rainbow Veggie Quinoa', mealSlot: 'lunch', tags: ['Vitamin Rich', 'Light'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Quinoa', qty: '150 g' }, { name: 'Bell Pepper', qty: '100 g' },
      { name: 'Carrot', qty: '80 g' }, { name: 'Spinach', qty: '80 g' },
      { name: 'Tomatoes', qty: '60 g' }, { name: 'Lemon', qty: '1 pcs' },
      { name: 'Coriander Leaves', qty: '15 g' },
    ],
    instructions: [
      'Cook quinoa with 2 cups water (15 min on low).',
      'Sauté diced bell pepper and carrot in oil (5 min).',
      'Add spinach and tomatoes. Cook 2 min.',
      'Mix vegetables into quinoa. Squeeze lemon.',
      'Garnish with fresh coriander. Serve warm.',
    ],
  },
  {
    id: 'vr3', name: 'Amla & Fruit Chaat', mealSlot: 'snack', tags: ['Vitamin Rich', 'Sweet'],
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'Apple', qty: '1 pcs' }, { name: 'Pomegranate', qty: '50 g' },
      { name: 'Banana', qty: '1 pcs' }, { name: 'Chaat Masala', qty: '1 tsp' },
      { name: 'Honey', qty: '1 tsp' }, { name: 'Lemon', qty: '0.5 pcs' },
    ],
    instructions: [
      'Dice apple and banana into bite-sized pieces.',
      'Combine with pomegranate seeds.',
      'Drizzle honey and lemon juice.',
      'Sprinkle chaat masala. Toss gently. Serve fresh.',
    ],
  },
  {
    id: 'vr4', name: 'Drumstick Sambar + Idli', mealSlot: 'dinner', tags: ['Vitamin Rich', 'Light'],
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'Idli Batter', qty: '200 g' }, { name: 'Drumstick', qty: '2 pcs' },
      { name: 'Toor Dal', qty: '80 g' }, { name: 'Tomatoes', qty: '100 g' },
      { name: 'Sambar Powder', qty: '2 tsp' }, { name: 'Tamarind', qty: '10 g' },
      { name: 'Carrot', qty: '40 g' }, { name: 'Mustard Seeds', qty: '1 tsp' },
    ],
    instructions: [
      'Steam idli batter in greased moulds for 12 min.',
      'Pressure cook dal (3 whistles). Mash well.',
      'Add drumstick pieces, carrot, tomatoes, tamarind water, sambar powder.',
      'Simmer 10 min. Temper with mustard seeds in oil.',
      'Serve hot sambar with fluffy idlis.',
    ],
  },
];

// ─── Helper: convert Recipe[] to legacy Meal[] for MealCard compat ───
export const allMeals: Meal[] = recipes.map(r => ({
  id: r.id,
  name: r.name,
  tags: r.tags,
  ingredients: r.ingredients.map(i => i.name),
}));

// ─── Today's suggested meals (default plan) ───
export const todaysMeals = {
  breakfast: recipes.find(r => r.id === 'b1')!,
  lunch: recipes.find(r => r.id === 'l1')!,
  snack: recipes.find(r => r.id === 's2')!,
  dinner: recipes.find(r => r.id === 'd1')!,
};

// ─── Grocery data (unchanged) ───
export const groceryCategories: GroceryCategory[] = [
  { id: 'masalas', name: 'Masalas & Spices', emoji: '🌶️' },
  { id: 'dairy', name: 'Milk Products', emoji: '🥛' },
  { id: 'millets', name: 'Millets & Grains', emoji: '🌾' },
  { id: 'rice', name: 'Rice & Staples', emoji: '🍚' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥕' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
];

export const groceryItems: GroceryItemData[] = [
  { id: 'g1', name: 'Basmati Rice', quantity: 2, unit: 'kg', status: 'available', category: 'rice' },
  { id: 'g2', name: 'Toor Dal', quantity: 0.5, unit: 'kg', status: 'low', category: 'rice' },
  { id: 'g3', name: 'Paneer', quantity: 0, unit: 'g', status: 'missing', category: 'dairy' },
  { id: 'g4', name: 'Whole Wheat Flour', quantity: 5, unit: 'kg', status: 'available', category: 'millets' },
  { id: 'g5', name: 'Ghee', quantity: 0.2, unit: 'L', status: 'low', category: 'dairy' },
  { id: 'g6', name: 'Tomatoes', quantity: 1, unit: 'kg', status: 'available', category: 'vegetables' },
  { id: 'g7', name: 'Onions', quantity: 2, unit: 'kg', status: 'available', category: 'vegetables' },
  { id: 'g8', name: 'Green Chilies', quantity: 0, unit: 'pcs', status: 'missing', category: 'vegetables' },
  { id: 'g9', name: 'Yogurt', quantity: 0.5, unit: 'L', status: 'available', category: 'dairy' },
  { id: 'g10', name: 'Spinach', quantity: 0, unit: 'bunch', status: 'missing', category: 'vegetables' },
  { id: 'g11', name: 'Mustard Seeds', quantity: 100, unit: 'g', status: 'available', category: 'masalas' },
  { id: 'g12', name: 'Cumin Seeds', quantity: 50, unit: 'g', status: 'low', category: 'masalas' },
  { id: 'g13', name: 'Turmeric Powder', quantity: 200, unit: 'g', status: 'available', category: 'masalas' },
  { id: 'g14', name: 'Cardamom', quantity: 10, unit: 'pcs', status: 'low', category: 'masalas' },
  { id: 'g15', name: 'Mango Pulp', quantity: 0, unit: 'can', status: 'missing', category: 'fruits' },
  { id: 'g16', name: 'Moong Dal', quantity: 1, unit: 'kg', status: 'available', category: 'rice' },
  { id: 'g17', name: 'Semolina', quantity: 0.5, unit: 'kg', status: 'available', category: 'millets' },
  { id: 'g18', name: 'Ragi Flour', quantity: 0, unit: 'kg', status: 'missing', category: 'millets' },
  { id: 'g19', name: 'Banana', quantity: 6, unit: 'pcs', status: 'available', category: 'fruits' },
  { id: 'g20', name: 'Apple', quantity: 2, unit: 'pcs', status: 'low', category: 'fruits' },
  { id: 'g21', name: 'Milk', quantity: 1, unit: 'L', status: 'available', category: 'dairy' },
  { id: 'g22', name: 'Coriander Powder', quantity: 150, unit: 'g', status: 'available', category: 'masalas' },
  { id: 'g23', name: 'Carrot', quantity: 0.5, unit: 'kg', status: 'available', category: 'vegetables' },
  { id: 'g24', name: 'Potato', quantity: 3, unit: 'kg', status: 'available', category: 'vegetables' },
];

export const historyData: HistoryEntry[] = [
  {
    date: '2026-04-14',
    items: [
      { name: 'Basmati Rice', quantity: '5 kg', change: '+5 kg' },
      { name: 'Toor Dal', quantity: '1 kg', change: '+1 kg' },
      { name: 'Tomatoes', quantity: '2 kg', change: '+2 kg' },
    ],
  },
  {
    date: '2026-04-12',
    items: [
      { name: 'Ghee', quantity: '1 L', change: '+1 L' },
      { name: 'Yogurt', quantity: '1 L', change: '+1 L' },
      { name: 'Onions', quantity: '3 kg', change: '+3 kg' },
    ],
  },
  {
    date: '2026-04-10',
    items: [
      { name: 'Whole Wheat Flour', quantity: '10 kg', change: '+10 kg' },
      { name: 'Mustard Seeds', quantity: '200 g', change: '+200 g' },
      { name: 'Cumin Seeds', quantity: '100 g', change: '+100 g' },
      { name: 'Turmeric Powder', quantity: '500 g', change: '+500 g' },
    ],
  },
];

export const mockOcrItems = [
  { name: 'Paneer', quantity: '500 g' },
  { name: 'Spinach', quantity: '3 bunch' },
  { name: 'Green Chilies', quantity: '10 pcs' },
  { name: 'Mango Pulp', quantity: '2 can' },
  { name: 'Cardamom', quantity: '50 pcs' },
  { name: 'Toor Dal', quantity: '2 kg' },
];
