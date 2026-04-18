/**
 * Video Recipe Extractor (YouTube + Instagram)
 *
 * YouTube Strategy:
 * 1. Get video title/metadata via oEmbed API (no CORS issues)
 * 2. Try to fetch YouTube page via Vite proxy to get captions
 * 3. If captions available → parse transcript into recipe
 * 4. If no captions → match video title against recipe template DB
 *
 * Instagram Strategy:
 * 1. Fetch page metadata/description from the URL
 * 2. Use Gemini AI to extract recipe from URL + description
 * 3. Fallback to recipe template matching from description
 * 4. Handles visual-only videos (ingredients shown on screen, no voiceover)
 */

export interface ExtractedRecipe {
  title: string;
  titleTamil: string;
  thumbnailUrl: string;
  channelName: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { stepNumber: number; text: string }[];
  videoUrl: string;
  platform: 'youtube' | 'instagram';
  language: string;
  rawTranscript: string;
}

// ── Recipe Template Database ──────────────────────────────────────
// Common Indian recipes with standard ingredients and steps
const RECIPE_TEMPLATES: Record<string, {
  keywords: string[];
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { stepNumber: number; text: string }[];
}> = {
  'chicken_biryani': {
    keywords: ['biryani', 'biriyani', 'dum biryani', 'chicken biryani', 'chicken biriyani', 'kalyana biriyani'],
    ingredients: [
      { name: 'Chicken', quantity: '500', unit: 'gm' },
      { name: 'Basmati Rice', quantity: '2', unit: 'cups' },
      { name: 'Onions (sliced)', quantity: '3', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Yogurt / Curd', quantity: '1', unit: 'cup' },
      { name: 'Ginger-Garlic Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '4', unit: 'nos' },
      { name: 'Mint Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Coriander Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Biryani Masala', quantity: '2', unit: 'tbsp' },
      { name: 'Red Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Ghee', quantity: '3', unit: 'tbsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Bay Leaves', quantity: '2', unit: 'nos' },
      { name: 'Cardamom', quantity: '4', unit: 'nos' },
      { name: 'Cinnamon Stick', quantity: '1', unit: 'inch' },
      { name: 'Cloves', quantity: '4', unit: 'nos' },
      { name: 'Star Anise', quantity: '1', unit: 'nos' },
      { name: 'Saffron (in warm milk)', quantity: '1', unit: 'pinch' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Lemon Juice', quantity: '1', unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, text: 'Wash and soak basmati rice for 30 minutes. Boil rice with whole spices (bay leaf, cardamom, cinnamon, cloves) until 70% cooked. Drain and set aside.' },
      { stepNumber: 2, text: 'Marinate chicken with yogurt, ginger-garlic paste, biryani masala, chili powder, turmeric, salt, lemon juice, and half the mint and coriander leaves. Let it rest for 30 minutes.' },
      { stepNumber: 3, text: 'Heat oil and ghee in a heavy-bottomed pot. Fry sliced onions until deep golden brown (birista). Remove half and set aside for garnish.' },
      { stepNumber: 4, text: 'Add the marinated chicken to the remaining onions. Cook on high heat for 5 minutes, then lower heat and cook until chicken is 80% done (about 10 minutes).' },
      { stepNumber: 5, text: 'Layer the partially cooked rice over the chicken. Sprinkle fried onions, remaining mint and coriander leaves, saffron milk, and ghee on top.' },
      { stepNumber: 6, text: 'Cover with a tight-fitting lid or seal with dough. Cook on high heat for 3-4 minutes, then reduce to the lowest heat and cook (dum) for 25-30 minutes.' },
      { stepNumber: 7, text: 'Turn off heat and let it rest for 5 minutes without opening the lid. Gently mix before serving. Serve hot with raita and salan.' },
    ],
  },
  'mutton_biryani': {
    keywords: ['mutton biryani', 'mutton biriyani', 'goat biryani', 'lamb biryani'],
    ingredients: [
      { name: 'Mutton', quantity: '500', unit: 'gm' },
      { name: 'Basmati Rice', quantity: '2', unit: 'cups' },
      { name: 'Onions (sliced)', quantity: '4', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Yogurt / Curd', quantity: '1', unit: 'cup' },
      { name: 'Ginger-Garlic Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '5', unit: 'nos' },
      { name: 'Mint Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Coriander Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Biryani Masala', quantity: '2', unit: 'tbsp' },
      { name: 'Ghee', quantity: '4', unit: 'tbsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Whole Spices (bay, cardamom, cinnamon, cloves, star anise)', quantity: 'as needed', unit: '' },
      { name: 'Saffron in warm milk', quantity: '1', unit: 'pinch' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Wash and soak basmati rice for 30 minutes. Pressure cook mutton with salt and whole spices until 70% done.' },
      { stepNumber: 2, text: 'Marinate mutton with yogurt, ginger-garlic paste, biryani masala, chili powder, and salt for at least 1 hour.' },
      { stepNumber: 3, text: 'Fry sliced onions until deep golden brown. Remove half for garnish. Cook marinated mutton with the remaining onions.' },
      { stepNumber: 4, text: 'Layer parboiled rice over the mutton. Add fried onions, mint, coriander, saffron milk, and ghee.' },
      { stepNumber: 5, text: 'Seal and cook on dum (lowest heat) for 40-45 minutes. Rest for 5 minutes, gently mix, and serve.' },
    ],
  },
  'butter_chicken': {
    keywords: ['butter chicken', 'murgh makhani', 'chicken makhani'],
    ingredients: [
      { name: 'Chicken (boneless)', quantity: '500', unit: 'gm' },
      { name: 'Butter', quantity: '4', unit: 'tbsp' },
      { name: 'Cream', quantity: '0.5', unit: 'cup' },
      { name: 'Tomato Puree', quantity: '2', unit: 'cups' },
      { name: 'Onion', quantity: '1', unit: 'large' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri Red Chili Powder', quantity: '1', unit: 'tbsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Dried Fenugreek Leaves (kasuri methi)', quantity: '1', unit: 'tsp' },
      { name: 'Sugar', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Marinate chicken with yogurt, ginger-garlic paste, chili powder, and salt for 30 minutes. Grill or pan-fry until charred.' },
      { stepNumber: 2, text: 'Melt butter in a pan. Sauté onion and ginger-garlic paste. Add tomato puree and cook for 15 minutes until oil separates.' },
      { stepNumber: 3, text: 'Blend the sauce smooth. Return to pan, add grilled chicken, cream, garam masala, kasuri methi, and sugar. Simmer for 10 minutes.' },
      { stepNumber: 4, text: 'Finish with a swirl of butter and cream. Serve hot with naan or jeera rice.' },
    ],
  },
  'chicken_curry': {
    keywords: ['chicken curry', 'chicken gravy', 'kozhi curry', 'kozhi kulambu', 'chicken masala'],
    ingredients: [
      { name: 'Chicken', quantity: '500', unit: 'gm' },
      { name: 'Onions', quantity: '2', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Ginger-Garlic Paste', quantity: '1.5', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '3', unit: 'nos' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Red Chili Powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Coriander Powder', quantity: '2', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Coriander Leaves (for garnish)', quantity: 'as needed', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Heat oil in a pan. Add curry leaves and sauté onions until golden brown.' },
      { stepNumber: 2, text: 'Add ginger-garlic paste and green chilies. Cook until raw smell goes away.' },
      { stepNumber: 3, text: 'Add tomatoes, turmeric, chili powder, and coriander powder. Cook until tomatoes are mushy and oil separates.' },
      { stepNumber: 4, text: 'Add chicken pieces and salt. Mix well and cook on medium heat for 10 minutes.' },
      { stepNumber: 5, text: 'Add water as needed, cover and cook until chicken is tender (about 20 minutes). Add garam masala, garnish with coriander leaves and serve.' },
    ],
  },
  'chicken_masala': {
    keywords: ['chicken masala', 'restaurant style chicken', 'chicken gravy masala', 'masala chicken'],
    ingredients: [
      { name: 'Chicken', quantity: '500', unit: 'gm' },
      { name: 'Onions (sliced)', quantity: '3', unit: 'large' },
      { name: 'Tomatoes', quantity: '3', unit: 'medium' },
      { name: 'Ginger-Garlic Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '3', unit: 'nos' },
      { name: 'Yogurt / Curd', quantity: '3', unit: 'tbsp' },
      { name: 'Kashmiri Red Chili Powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Coriander Powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Cumin Powder', quantity: '1', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '4', unit: 'tbsp' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Coriander Leaves (garnish)', quantity: 'as needed', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Marinate chicken with yogurt, turmeric, chili powder, and salt for 15-30 minutes.' },
      { stepNumber: 2, text: 'Heat oil in a heavy-bottomed pan. Add sliced onions and cook until deep golden brown.' },
      { stepNumber: 3, text: 'Add ginger-garlic paste and green chilies. Sauté until raw smell disappears.' },
      { stepNumber: 4, text: 'Add chopped tomatoes and cook until mushy and oil separates.' },
      { stepNumber: 5, text: 'Add coriander powder, cumin powder, and remaining chili powder. Cook spices for 2 minutes.' },
      { stepNumber: 6, text: 'Add marinated chicken, mix well. Cook on high heat for 5 minutes, then reduce to medium.' },
      { stepNumber: 7, text: 'Add water as needed, cover and cook for 15-20 minutes until chicken is tender and gravy thickens.' },
      { stepNumber: 8, text: 'Add garam masala, curry leaves. Garnish with fresh coriander. Serve hot with naan or rice.' },
    ],
  },
  'sambar': {
    keywords: ['sambar', 'sambhar', 'sambar recipe'],
    ingredients: [
      { name: 'Toor Dal', quantity: '1', unit: 'cup' },
      { name: 'Mixed Vegetables (drumstick, carrot, brinjal)', quantity: '1.5', unit: 'cups' },
      { name: 'Tamarind', quantity: '1', unit: 'small piece' },
      { name: 'Sambar Powder', quantity: '2', unit: 'tbsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Mustard Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Onion', quantity: '1', unit: 'medium' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Pressure cook toor dal with turmeric until soft. Mash and set aside.' },
      { stepNumber: 2, text: 'Cook vegetables in tamarind water with sambar powder until tender.' },
      { stepNumber: 3, text: 'Add cooked dal to the vegetables. Simmer for 10 minutes.' },
      { stepNumber: 4, text: 'Temper with mustard seeds, curry leaves, and dried red chilies. Add to sambar and serve hot with rice.' },
    ],
  },
  'dosa': {
    keywords: ['dosa', 'dosai', 'crispy dosa', 'plain dosa', 'masala dosa'],
    ingredients: [
      { name: 'Rice', quantity: '3', unit: 'cups' },
      { name: 'Urad Dal', quantity: '1', unit: 'cup' },
      { name: 'Fenugreek Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Oil', quantity: 'as needed', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Soak rice and urad dal separately for 4-6 hours. Grind to a smooth batter and ferment overnight.' },
      { stepNumber: 2, text: 'Add salt to fermented batter. Heat a flat griddle/tawa and pour a ladle of batter.' },
      { stepNumber: 3, text: 'Spread batter in circular motion to make thin dosa. Drizzle oil around edges.' },
      { stepNumber: 4, text: 'Cook until golden and crispy. Serve with coconut chutney and sambar.' },
    ],
  },
  'idli': {
    keywords: ['idli', 'idly', 'soft idli'],
    ingredients: [
      { name: 'Idli Rice', quantity: '2', unit: 'cups' },
      { name: 'Urad Dal', quantity: '1', unit: 'cup' },
      { name: 'Fenugreek Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Soak rice and urad dal separately for 4-6 hours. Grind urad dal first to fluffy batter, then grind rice.' },
      { stepNumber: 2, text: 'Mix both batters, add salt, and ferment overnight until doubled in volume.' },
      { stepNumber: 3, text: 'Grease idli moulds and pour batter. Steam for 12-15 minutes.' },
      { stepNumber: 4, text: 'Remove gently and serve hot with sambar and chutney.' },
    ],
  },
  'paneer_butter_masala': {
    keywords: ['paneer butter masala', 'paneer masala', 'paneer tikka masala', 'paneer curry'],
    ingredients: [
      { name: 'Paneer', quantity: '250', unit: 'gm' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Cream', quantity: '3', unit: 'tbsp' },
      { name: 'Tomato Puree', quantity: '1.5', unit: 'cups' },
      { name: 'Onion', quantity: '1', unit: 'large' },
      { name: 'Cashews', quantity: '10', unit: 'nos' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Kasuri Methi', quantity: '1', unit: 'tsp' },
      { name: 'Sugar', quantity: '0.5', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Sauté onions and cashews in butter until soft. Add tomato puree and cook for 10 minutes. Blend to a smooth paste.' },
      { stepNumber: 2, text: 'Heat butter in a pan. Add ginger-garlic paste, then the blended gravy. Add chili powder and cook 5 minutes.' },
      { stepNumber: 3, text: 'Add paneer cubes, cream, garam masala, kasuri methi, sugar, and salt. Simmer for 5-7 minutes.' },
      { stepNumber: 4, text: 'Garnish with cream and coriander. Serve hot with naan or roti.' },
    ],
  },
};

// ── Additional Recipe Templates ──────────────────────────────────
const MORE_TEMPLATES: typeof RECIPE_TEMPLATES = {
  'dal_tadka': {
    keywords: ['dal', 'dal fry', 'dal tadka', 'toor dal', 'yellow dal', 'masoor dal'],
    ingredients: [
      { name: 'Toor Dal / Masoor Dal', quantity: '1', unit: 'cup' },
      { name: 'Onion (chopped)', quantity: '1', unit: 'medium' },
      { name: 'Tomato (chopped)', quantity: '1', unit: 'medium' },
      { name: 'Green Chilies', quantity: '2', unit: 'nos' },
      { name: 'Garlic (chopped)', quantity: '4', unit: 'cloves' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Red Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Cumin Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Mustard Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '8', unit: 'leaves' },
      { name: 'Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Coriander Leaves', quantity: 'for garnish', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Wash and pressure cook dal with turmeric and salt for 3-4 whistles until soft. Mash well.' },
      { stepNumber: 2, text: 'Heat ghee in a pan. Add cumin seeds, mustard seeds, curry leaves, and chopped garlic. Sauté until golden.' },
      { stepNumber: 3, text: 'Add chopped onions and green chilies. Cook until onions turn translucent.' },
      { stepNumber: 4, text: 'Add tomatoes and red chili powder. Cook until tomatoes are soft.' },
      { stepNumber: 5, text: 'Pour the tempering over the cooked dal. Mix well, simmer for 5 minutes. Garnish with coriander and serve with rice.' },
    ],
  },
  'rasam': {
    keywords: ['rasam', 'pepper rasam', 'tomato rasam', 'lemon rasam'],
    ingredients: [
      { name: 'Toor Dal (cooked)', quantity: '0.5', unit: 'cup' },
      { name: 'Tomato', quantity: '2', unit: 'medium' },
      { name: 'Tamarind', quantity: '1', unit: 'small piece' },
      { name: 'Rasam Powder', quantity: '1.5', unit: 'tbsp' },
      { name: 'Turmeric Powder', quantity: '0.25', unit: 'tsp' },
      { name: 'Mustard Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Cumin Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Garlic (crushed)', quantity: '3', unit: 'cloves' },
      { name: 'Coriander Leaves', quantity: 'for garnish', unit: '' },
      { name: 'Oil / Ghee', quantity: '1', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Soak tamarind in warm water, extract juice. Chop tomatoes.' },
      { stepNumber: 2, text: 'Boil tamarind water with tomatoes, turmeric, rasam powder, and salt.' },
      { stepNumber: 3, text: 'Add mashed dal and simmer for 10 minutes until frothy.' },
      { stepNumber: 4, text: 'Temper with mustard seeds, cumin, garlic, and curry leaves. Add to rasam. Garnish with coriander and serve.' },
    ],
  },
  'upma': {
    keywords: ['upma', 'rava upma', 'sooji upma', 'semolina upma'],
    ingredients: [
      { name: 'Rava / Semolina', quantity: '1', unit: 'cup' },
      { name: 'Onion (chopped)', quantity: '1', unit: 'medium' },
      { name: 'Green Chilies', quantity: '2', unit: 'nos' },
      { name: 'Ginger (grated)', quantity: '1', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '8', unit: 'leaves' },
      { name: 'Mustard Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Urad Dal', quantity: '1', unit: 'tsp' },
      { name: 'Chana Dal', quantity: '1', unit: 'tsp' },
      { name: 'Cashews', quantity: '8', unit: 'nos' },
      { name: 'Water', quantity: '2.5', unit: 'cups' },
      { name: 'Oil / Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Lemon Juice', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, text: 'Dry roast rava until light golden and fragrant. Set aside.' },
      { stepNumber: 2, text: 'Heat oil. Add mustard seeds, urad dal, chana dal, cashews, curry leaves, and green chilies. Sauté.' },
      { stepNumber: 3, text: 'Add chopped onion and ginger. Cook until translucent.' },
      { stepNumber: 4, text: 'Add water and salt. Bring to a boil. Slowly add roasted rava while stirring continuously to avoid lumps.' },
      { stepNumber: 5, text: 'Cook on low heat for 3-4 minutes until water is absorbed. Add lemon juice and serve hot.' },
    ],
  },
  'poha': {
    keywords: ['poha', 'pohe', 'flattened rice', 'aval', 'beaten rice'],
    ingredients: [
      { name: 'Poha (thick)', quantity: '2', unit: 'cups' },
      { name: 'Onion (chopped)', quantity: '1', unit: 'medium' },
      { name: 'Green Chilies', quantity: '2', unit: 'nos' },
      { name: 'Peanuts', quantity: '2', unit: 'tbsp' },
      { name: 'Mustard Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '8', unit: 'leaves' },
      { name: 'Turmeric Powder', quantity: '0.25', unit: 'tsp' },
      { name: 'Sugar', quantity: '1', unit: 'tsp' },
      { name: 'Lemon Juice', quantity: '1', unit: 'tbsp' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Coriander Leaves', quantity: 'for garnish', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Rinse poha in water, drain immediately. Add turmeric, salt, and sugar. Mix gently.' },
      { stepNumber: 2, text: 'Heat oil. Add mustard seeds, peanuts, curry leaves, and green chilies. Sauté until peanuts are golden.' },
      { stepNumber: 3, text: 'Add onions and cook until soft. Add the soaked poha and toss gently.' },
      { stepNumber: 4, text: 'Cook for 2-3 minutes. Add lemon juice, garnish with coriander and serve.' },
    ],
  },
  'egg_curry': {
    keywords: ['egg curry', 'egg masala', 'anda curry', 'egg gravy', 'boiled egg curry'],
    ingredients: [
      { name: 'Eggs (boiled)', quantity: '6', unit: 'nos' },
      { name: 'Onions (chopped)', quantity: '2', unit: 'medium' },
      { name: 'Tomatoes (chopped)', quantity: '2', unit: 'medium' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Red Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Coriander Powder', quantity: '1', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '0.5', unit: 'tsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Coriander Leaves', quantity: 'for garnish', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Boil and peel eggs. Make slits for better absorption. Lightly fry in oil until golden. Set aside.' },
      { stepNumber: 2, text: 'In the same oil, sauté onions until golden. Add ginger-garlic paste and cook 2 minutes.' },
      { stepNumber: 3, text: 'Add tomatoes, turmeric, chili powder, and coriander powder. Cook until oil separates.' },
      { stepNumber: 4, text: 'Add water to make gravy. Add eggs and garam masala. Simmer for 10 minutes. Garnish and serve with rice or roti.' },
    ],
  },
  'fish_curry': {
    keywords: ['fish curry', 'meen kulambu', 'fish masala', 'meen curry', 'fish gravy'],
    ingredients: [
      { name: 'Fish pieces', quantity: '500', unit: 'gm' },
      { name: 'Onions (sliced)', quantity: '2', unit: 'medium' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Tamarind extract', quantity: '2', unit: 'tbsp' },
      { name: 'Red Chili Powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Coriander Powder', quantity: '1', unit: 'tsp' },
      { name: 'Fenugreek Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Coconut Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Marinate fish with turmeric and salt. Set aside for 15 minutes.' },
      { stepNumber: 2, text: 'Heat oil, add fenugreek seeds and curry leaves. Sauté onions until golden.' },
      { stepNumber: 3, text: 'Add tomatoes, chili powder, coriander powder. Cook until mushy.' },
      { stepNumber: 4, text: 'Add tamarind extract and water. Bring to a boil. Gently add fish pieces.' },
      { stepNumber: 5, text: 'Simmer on low heat for 10-12 minutes. Do not stir, just swirl the pan. Serve with rice.' },
    ],
  },
  'fried_rice': {
    keywords: ['fried rice', 'veg fried rice', 'egg fried rice', 'chinese fried rice', 'schezwan fried rice'],
    ingredients: [
      { name: 'Cooked Rice (cooled)', quantity: '3', unit: 'cups' },
      { name: 'Mixed Vegetables (diced)', quantity: '1', unit: 'cup' },
      { name: 'Eggs', quantity: '2', unit: 'nos' },
      { name: 'Spring Onions', quantity: '4', unit: 'stalks' },
      { name: 'Garlic (minced)', quantity: '1', unit: 'tbsp' },
      { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Vinegar', quantity: '1', unit: 'tsp' },
      { name: 'Pepper Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Heat oil on high heat. Scramble eggs, break into pieces, set aside.' },
      { stepNumber: 2, text: 'Sauté garlic until fragrant. Add diced vegetables and stir-fry for 2-3 minutes.' },
      { stepNumber: 3, text: 'Add cooled rice, toss on high heat. Add soy sauce, vinegar, pepper, and salt.' },
      { stepNumber: 4, text: 'Add scrambled eggs back. Toss well. Garnish with spring onions and serve hot.' },
    ],
  },
  'chapati': {
    keywords: ['chapati', 'roti', 'phulka', 'wheat roti', 'soft chapati', 'soft roti'],
    ingredients: [
      { name: 'Wheat Flour', quantity: '2', unit: 'cups' },
      { name: 'Water', quantity: 'as needed', unit: '' },
      { name: 'Salt', quantity: '0.5', unit: 'tsp' },
      { name: 'Oil / Ghee', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, text: 'Mix flour with salt. Gradually add water and knead into a soft, smooth dough. Rest for 15-20 minutes.' },
      { stepNumber: 2, text: 'Divide into equal portions. Roll each into a thin circle using dry flour.' },
      { stepNumber: 3, text: 'Heat a tawa/griddle. Place rolled chapati, cook until bubbles appear. Flip and cook the other side.' },
      { stepNumber: 4, text: 'Place directly on flame to puff up (phulka). Apply ghee and serve hot.' },
    ],
  },
  'paratha': {
    keywords: ['paratha', 'aloo paratha', 'gobi paratha', 'stuffed paratha', 'laccha paratha'],
    ingredients: [
      { name: 'Wheat Flour', quantity: '2', unit: 'cups' },
      { name: 'Potatoes (boiled, mashed)', quantity: '3', unit: 'medium' },
      { name: 'Green Chilies (chopped)', quantity: '2', unit: 'nos' },
      { name: 'Cumin Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Red Chili Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Coriander Leaves', quantity: '2', unit: 'tbsp' },
      { name: 'Ghee / Butter', quantity: 'for frying', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Knead wheat flour with water and salt into soft dough. Rest 15 minutes.' },
      { stepNumber: 2, text: 'Mix mashed potatoes with green chilies, cumin, chili powder, coriander, and salt for the stuffing.' },
      { stepNumber: 3, text: 'Take a portion of dough, flatten, place stuffing inside, seal and roll gently into a circle.' },
      { stepNumber: 4, text: 'Cook on hot tawa with ghee on both sides until golden brown. Serve hot with curd or pickle.' },
    ],
  },
  'noodles': {
    keywords: ['noodles', 'hakka noodles', 'veg noodles', 'chow mein', 'schezwan noodles'],
    ingredients: [
      { name: 'Noodles', quantity: '200', unit: 'gm' },
      { name: 'Mixed Vegetables (julienned)', quantity: '1.5', unit: 'cups' },
      { name: 'Garlic (minced)', quantity: '1', unit: 'tbsp' },
      { name: 'Spring Onions', quantity: '4', unit: 'stalks' },
      { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Chili Sauce', quantity: '1', unit: 'tbsp' },
      { name: 'Vinegar', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Pepper', quantity: '0.5', unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, text: 'Boil noodles as per package instructions. Drain, toss with a little oil to prevent sticking.' },
      { stepNumber: 2, text: 'Heat oil on high heat. Add garlic, stir-fry vegetables for 2-3 minutes keeping them crunchy.' },
      { stepNumber: 3, text: 'Add soy sauce, chili sauce, vinegar, salt, and pepper. Toss well.' },
      { stepNumber: 4, text: 'Add boiled noodles. Toss on high heat for 2 minutes. Garnish with spring onions and serve.' },
    ],
  },
};

// Merge all templates
Object.assign(RECIPE_TEMPLATES, MORE_TEMPLATES);

// ── Transcript Noise Filter ──────────────────────────────────────
const COOKING_KEYWORDS = ['cook', 'add', 'mix', 'stir', 'heat', 'boil', 'fry', 'roast', 'bake', 'ingredient', 'recipe', 'salt', 'sugar', 'oil', 'water', 'onion', 'garlic', 'masala', 'spice', 'chicken', 'rice', 'flour', 'cup', 'tbsp', 'tsp', 'minutes', 'ginger', 'tomato', 'pepper', 'chili', 'pan', 'pot', 'oven', 'simmer', 'marinate', 'garnish', 'serve', 'chop', 'slice', 'dice', 'grate', 'blend', 'grind'];

function isTranscriptUseful(transcript: string): boolean {
  if (!transcript || transcript.length < 30) return false;
  const lower = transcript.toLowerCase();
  const matchCount = COOKING_KEYWORDS.filter(kw => lower.includes(kw)).length;
  // If less than 3 cooking keywords in the entire transcript, it's likely noise
  return matchCount >= 3;
}

/**
 * Pre-parse structured description text to extract ingredient lists
 */
function parseDescriptionStructured(description: string): { ingredients: string; steps: string } {
  let ingredientSection = '';
  let stepsSection = '';
  const lines = description.split('\n');
  let mode: 'none' | 'ingredients' | 'steps' = 'none';

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(ingredients?|what you need|you.?ll need)[:\s]*$/i.test(trimmed)) {
      mode = 'ingredients'; continue;
    }
    if (/^(method|steps|instructions?|directions?|how to make|procedure)[:\s]*$/i.test(trimmed)) {
      mode = 'steps'; continue;
    }
    if (mode === 'ingredients' && trimmed) ingredientSection += trimmed + '\n';
    if (mode === 'steps' && trimmed) stepsSection += trimmed + '\n';
  }
  return { ingredients: ingredientSection.trim(), steps: stepsSection.trim() };
}

/**
 * Parse any video URL into platform + id + canonical URL
 */
export type VideoPlatform = 'youtube' | 'instagram';
export interface ParsedVideo {
  platform: VideoPlatform;
  id: string;
  canonicalUrl: string;
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
];
const INSTAGRAM_PATTERNS = [
  /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
  /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
  /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
];

export function parseVideoUrl(url: string): ParsedVideo | null {
  for (const p of YOUTUBE_PATTERNS) {
    const m = url.match(p);
    if (m) return { platform: 'youtube', id: m[1], canonicalUrl: `https://www.youtube.com/watch?v=${m[1]}` };
  }
  for (const p of INSTAGRAM_PATTERNS) {
    const m = url.match(p);
    if (m) return { platform: 'instagram', id: m[1], canonicalUrl: `https://www.instagram.com/reel/${m[1]}/` };
  }
  return null;
}

/**
 * Extract video ID from YouTube URL (backward compat)
 */
function extractVideoId(url: string): string | null {
  const parsed = parseVideoUrl(url);
  return parsed?.platform === 'youtube' ? parsed.id : null;
}

/**
 * Match a video title against recipe templates
 */
function matchRecipeTemplate(title: string): typeof RECIPE_TEMPLATES[string] | null {
  const lower = title.toLowerCase();
  for (const [, template] of Object.entries(RECIPE_TEMPLATES)) {
    for (const keyword of template.keywords) {
      if (lower.includes(keyword)) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Fetch the YouTube watch page and try to extract captions
 */
async function tryExtractCaptions(videoId: string): Promise<{
  transcript: string;
  description: string;
  title: string;
}> {
  try {
    // Add &app=desktop to prevent YouTube from redirecting to m.youtube.com
    // Re-directs bypass the Vite proxy and cause CORS errors.
    const resp = await fetch(`/ytapi/watch?v=${videoId}&app=desktop`, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!resp.ok) return { transcript: '', description: '', title: '' };

    const html = await resp.text();

    // Extract ytInitialPlayerResponse with proper bracket matching
    const idx = html.indexOf('ytInitialPlayerResponse');
    if (idx === -1) return { transcript: '', description: '', title: '' };

    const start = html.indexOf('{', idx);
    let depth = 0, end = start;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') depth--;
      if (depth === 0) { end = i + 1; break; }
    }

    const data = JSON.parse(html.substring(start, end));
    const title = data?.videoDetails?.title || '';
    const description = data?.videoDetails?.shortDescription || '';

    // Try to get captions
    const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    let transcript = '';

    if (captionTracks.length > 0) {
      // Try English first, then translated, then original
      const enTrack = captionTracks.find((t: any) => t.languageCode?.startsWith('en'));

      if (enTrack) {
        transcript = await fetchCaptions(enTrack.baseUrl);
      } else {
        const first = captionTracks[0];
        transcript = await fetchCaptions(first.baseUrl, 'en') || await fetchCaptions(first.baseUrl);
      }
    }

    return { transcript, description, title };
  } catch (e) {
    console.warn('YouTube page extraction failed:', e);
    return { transcript: '', description: '', title: '' };
  }
}

async function fetchCaptions(baseUrl: string, translateLang?: string): Promise<string> {
  let url = baseUrl.replace('https://www.youtube.com', '/ytapi');
  if (translateLang) url += `&tlang=${translateLang}`;
  url += '&fmt=json3';

  try {
    const resp = await fetch(url);
    if (!resp.ok) return '';
    const data = await resp.json();
    if (data.events) {
      return data.events
        .filter((e: any) => e.segs)
        .map((e: any) => e.segs.map((s: any) => s.utf8 || '').join(''))
        .join(' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch { /* ignore */ }
  return '';
}

/**
 * Parse transcript text into ingredients + steps
 */
function parseTranscript(transcript: string, description: string): {
  ingredients: ExtractedRecipe['ingredients'];
  steps: ExtractedRecipe['steps'];
} {
  const ingredients: ExtractedRecipe['ingredients'] = [];
  const steps: ExtractedRecipe['steps'] = [];
  const seen = new Set<string>();
  const fullText = `${description}\n${transcript}`;

  const segments = fullText.split(/[.,\n]+/).map(s => s.trim()).filter(s => s.length > 3);

  const qtyPattern = /(\d+\.?\d*)\s*(cup|cups|tbsp|tsp|g|gm|kg|ml|piece|pcs|nos|whole|inch|pinch|bunch|clove|cloves|large|medium|small|handful|lb|oz|slice|slices|leaves|stick|sticks)s?\s+(?:of\s+)?(.+)/i;
  const foodWords = ['salt', 'pepper', 'oil', 'water', 'sugar', 'chicken', 'rice', 'onion', 'garlic', 'ginger', 'tomato', 'masala', 'ghee', 'curd', 'yogurt', 'mint', 'coriander', 'cumin', 'turmeric', 'chili', 'chilli', 'coconut', 'curry', 'paneer', 'butter', 'cream'];
  const actionWords = /^(first|then|next|add|mix|stir|heat|cook|boil|fry|roast|marinate|grind|blend|chop|wash|peel|drain|serve|garnish|cover|remove|pour|place|simmer|steam|grill)/i;

  let stepNum = 1;
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    const qm = seg.match(qtyPattern);
    if (qm) {
      const name = qm[3].replace(/[,.\s]+$/, '').trim();
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        ingredients.push({ name: name.charAt(0).toUpperCase() + name.slice(1), quantity: qm[1], unit: qm[2].toLowerCase() });
      }
    } else if (foodWords.some(f => lower.includes(f)) && seg.length < 50 && !actionWords.test(seg)) {
      const name = seg.replace(/[,.\s]+$/, '').trim();
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        ingredients.push({ name: name.charAt(0).toUpperCase() + name.slice(1), quantity: 'as needed', unit: '' });
      }
    } else if (actionWords.test(seg) && seg.length > 15) {
      steps.push({ stepNumber: stepNum++, text: seg.charAt(0).toUpperCase() + seg.slice(1) });
    }
  }

  if (steps.length === 0 && transcript.length > 50) {
    transcript.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10).forEach((t, i) => {
      steps.push({ stepNumber: i + 1, text: t.trim().charAt(0).toUpperCase() + t.trim().slice(1) });
    });
  }

  return { ingredients, steps };
}

/**
 * Extract recipe from an Instagram URL using Gemini AI
 */
async function extractFromInstagram(
  url: string,
  parsedVideo: ParsedVideo,
  videoLanguage: string
): Promise<{ success: boolean; recipe?: ExtractedRecipe; error?: string }> {
  // 1. Get metadata via noembed (avoids CORS — same approach as YouTube)
  // Instagram direct page fetch is always blocked by CORS in browser context
  let description = '';
  let title = '';
  try {
    const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(parsedVideo.canonicalUrl)}`;
    const resp = await fetch(noembedUrl, { signal: AbortSignal.timeout(5000) });
    if (resp.ok) {
      const data = await resp.json();
      title = (data.title || '').trim();
      // noembed may return author_name for Instagram
      if (data.author_name && !title) title = data.author_name;
    }
  } catch { /* ignore */ }

  // 2. Extract the reel ID to include in the prompt
  const reelId = parsedVideo.id;

  // 3. Call AI with all available context (uses Gemini or Groq with key rotation)
  try {
    const { extractWithAI } = await import('./aiFetcher');
    const prompt = `I need to extract a complete recipe from this Instagram cooking reel: ${parsedVideo.canonicalUrl}

Reel ID: ${reelId}
${title ? `Title/info: ${title}` : ''}

IMPORTANT: This is likely a VISUAL-ONLY cooking video — it may have background music only, no voiceover. Ingredients and steps may be shown as on-screen text overlays or simply shown visually while cooking. Use the title, any available description, and your extensive cooking knowledge to provide a COMPLETE recipe.

Instructions:
1. Identify the recipe name from the title/description
2. List ALL ingredients with exact quantities and units — do NOT skip any
3. Write detailed step-by-step cooking instructions
4. Estimate prep time in minutes
5. If the title mentions a dish you recognize, provide the FULL authentic recipe

Return ONLY a raw JSON object (no markdown, no code fences):
{"name":"Recipe Name","ingredients":[{"name":"Ingredient","quantity":"2","unit":"tbsp"}],"steps":[{"stepNumber":1,"text":"Step description"}],"prepTimeMinutes":30}`;

    const rawText = await extractWithAI(prompt);
    if (rawText) {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      // Find first { to handle any prefix text
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
        if (parsed.name && (parsed.ingredients?.length > 0 || parsed.steps?.length > 0)) {
          return {
            success: true,
            recipe: {
              title: parsed.name,
              titleTamil: '',
              thumbnailUrl: '',
              channelName: title || '',
              ingredients: (parsed.ingredients || []).map((i: any) => ({
                name: String(i.name || '').trim(),
                quantity: String(i.quantity || ''),
                unit: String(i.unit || ''),
              })),
              steps: (parsed.steps || []).map((s: any, idx: number) => ({
                stepNumber: s.stepNumber || idx + 1,
                text: String(s.text || '').trim(),
              })),
              videoUrl: url,
              platform: 'instagram',
              language: videoLanguage,
              rawTranscript: description,
            },
          };
        }
      }
    }
  } catch (e) {
    console.warn('AI extraction failed for Instagram:', e);
  }

  // 3. Fallback: try template matching from description
  const searchText = `${title} ${description}`;
  const template = matchRecipeTemplate(searchText);
  if (template) {
    // Extract a clean recipe name from the description
    let recipeName = 'Recipe from Instagram';
    const namePatterns = [
      /restaurant[- ]style\s+([\w\s]+?)(?:\s+in|\s+recipe|\.|!|$)/i,
      /([\w\s]+?)(?:\s+recipe|\s+in just|\.|!|$)/i,
    ];
    for (const pattern of namePatterns) {
      const match = description.match(pattern);
      if (match && match[1].trim().length > 3) {
        recipeName = match[1].trim().replace(/^you need to try this\s*/i, '').trim();
        if (recipeName.length > 3) {
          recipeName = recipeName.charAt(0).toUpperCase() + recipeName.slice(1);
          break;
        }
      }
    }

    console.log(`Matched Instagram recipe template for: "${searchText.slice(0, 60)}..."`);
    return {
      success: true,
      recipe: {
        title: recipeName,
        titleTamil: '',
        thumbnailUrl: '',
        channelName: title || '',
        ingredients: [...template.ingredients],
        steps: [...template.steps],
        videoUrl: url,
        platform: 'instagram',
        language: videoLanguage,
        rawTranscript: description,
      },
    };
  }

  return { success: false, error: 'Could not extract recipe from this Instagram video. You can add details manually.' };
}

/**
 * Main extraction function — supports both YouTube and Instagram
 */
export async function extractRecipeFromVideo(
  url: string,
  videoLanguage: string = 'ta'
): Promise<{ success: boolean; recipe?: ExtractedRecipe; error?: string }> {
  try {
    // Detect platform
    const parsedVideo = parseVideoUrl(url);
    if (!parsedVideo) return { success: false, error: 'Could not parse video URL. Please check the link.' };

    // ─── Instagram path ───
    if (parsedVideo.platform === 'instagram') {
      return extractFromInstagram(url, parsedVideo, videoLanguage);
    }

    // ─── YouTube path ───
    const videoId = parsedVideo.id;

    // 1. Get metadata from oEmbed
    let title = '';
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let channelName = '';

    try {
      const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const data = await resp.json();
        title = (data.title || '').replace(/[🥳🔥✅💯❤️😍🤤😋🎉👌💕]/g, '').trim();
        thumbnailUrl = data.thumbnail_url || thumbnailUrl;
        channelName = data.author_name || '';
      }
    } catch { /* ignore */ }

    // 2. Try to extract captions from YouTube page
    const pageData = await tryExtractCaptions(videoId);
    if (pageData.title && !title) title = pageData.title;
    const rawTranscript = pageData.transcript;

    // 3. PRIMARY: Use AI to extract recipe from ALL available context
    //    This handles: ingredients in description, spoken in audio (via captions), or in title
    let ingredients: ExtractedRecipe['ingredients'] = [];
    let steps: ExtractedRecipe['steps'] = [];
    let aiTitle = '';

    try {
      const { extractWithAI } = await import('./aiFetcher');

      // Pre-parse structured description sections
      const descStructured = parseDescriptionStructured(pageData.description);
      const hasUsefulTranscript = isTranscriptUseful(rawTranscript);

      // Build a rich context string for the AI
      const contextParts: string[] = [];
      if (title) contextParts.push(`Video Title: ${title}`);
      if (channelName) contextParts.push(`Channel: ${channelName}`);
      if (descStructured.ingredients) contextParts.push(`Ingredients Found in Description:\n${descStructured.ingredients}`);
      if (descStructured.steps) contextParts.push(`Steps Found in Description:\n${descStructured.steps}`);
      if (pageData.description) contextParts.push(`Full Video Description:\n${pageData.description.slice(0, 3000)}`);
      if (hasUsefulTranscript) contextParts.push(`Video Transcript/Captions:\n${rawTranscript.slice(0, 4000)}`);

      // Choose prompt style based on what data is available
      const isVisualOnly = !hasUsefulTranscript;

      const prompt = isVisualOnly
        ? `This is a VISUAL-ONLY cooking video (background music, no voiceover). The recipe must be identified from the title, description, and your cooking knowledge.

${contextParts.join('\n\n')}

Since this video has NO spoken words or captions, use:
1. The video TITLE to identify the dish
2. The DESCRIPTION for any listed ingredients or steps
3. Your extensive cooking knowledge to provide a COMPLETE recipe with ALL ingredients and detailed step-by-step instructions

Return ONLY a raw JSON object (no markdown, no code fences):
{"name":"Recipe Name","ingredients":[{"name":"Ingredient","quantity":"2","unit":"tbsp"}],"steps":[{"stepNumber":1,"text":"Step description"}],"prepTimeMinutes":30}

Provide a COMPLETE recipe — do not skip any ingredients. Estimate reasonable quantities.`
        : `Extract a complete cooking recipe from this YouTube video information:

${contextParts.join('\n\n')}

Analyze ALL the information above — the title, description, and transcript/captions. Ingredients may appear in ANY of these: written in the description, spoken in the video (captured in transcript), or implied by the title. Note: the speaker may talk casually or off-topic — focus ONLY on cooking-related content.

Return ONLY a raw JSON object (no markdown, no code fences):
{"name":"Recipe Name","ingredients":[{"name":"Ingredient","quantity":"2","unit":"tbsp"}],"steps":[{"stepNumber":1,"text":"Step description"}],"prepTimeMinutes":30}

Be thorough — extract every ingredient mentioned with accurate quantities. If quantities aren't mentioned, estimate reasonable amounts. Write clear step-by-step instructions.`;

      const rawText = await extractWithAI(prompt);
      if (rawText) {
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
          if (parsed.name) aiTitle = parsed.name;
          if (parsed.ingredients?.length > 0) {
            ingredients = parsed.ingredients.map((i: any) => ({
              name: String(i.name || '').trim(),
              quantity: String(i.quantity || ''),
              unit: String(i.unit || ''),
            }));
          }
          if (parsed.steps?.length > 0) {
            steps = parsed.steps.map((s: any, idx: number) => ({
              stepNumber: s.stepNumber || idx + 1,
              text: String(s.text || '').trim(),
            }));
          }
        }
      }
    } catch (e) {
      console.warn('AI extraction failed for YouTube, falling back to parsing:', e);
    }

    // 4. FALLBACK: If AI didn't work, try transcript parsing + template matching
    if (ingredients.length === 0 && steps.length === 0) {
      if (rawTranscript) {
        const parsed = parseTranscript(rawTranscript, pageData.description);
        ingredients = parsed.ingredients;
        steps = parsed.steps;
      }
    }

    if (ingredients.length === 0 && steps.length === 0) {
      const template = matchRecipeTemplate(title);
      if (template) {
        ingredients = [...template.ingredients];
        steps = [...template.steps];
        console.log(`Matched recipe template for: "${title}"`);
      }
    }

    // 5. Clean title — use AI title if available, otherwise clean original
    let cleanTitle = aiTitle || title;
    if (!aiTitle) {
      const titleParts = title.split('|').map(p => p.trim());
      if (titleParts.length > 1) {
        const recipePart = titleParts.find(p =>
          /biryani|biriyani|curry|masala|chicken|mutton|rice|dosa|idli|paneer|butter|sambar/i.test(p)
        );
        cleanTitle = recipePart || titleParts.reduce((a, b) => a.length > b.length ? a : b);
      }
    }
    cleanTitle = cleanTitle
      .replace(/@\S+/g, '')
      .replace(/^(frequently asked recipe|recipe)\s*[:|]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      recipe: {
        title: cleanTitle || 'Untitled Recipe',
        titleTamil: '',
        thumbnailUrl,
        channelName,
        ingredients,
        steps,
        videoUrl: url,
        platform: 'youtube',
        language: videoLanguage,
        rawTranscript,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
