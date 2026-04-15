export type FlavorTag = 'Spicy' | 'Sweet' | 'Light' | 'Balanced';

export interface Meal {
  id: string;
  name: string;
  tags: FlavorTag[];
  ingredients: string[];
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

export const todaysMeals = {
  breakfast: { id: 'b1', name: 'Masala Dosa', tags: ['Spicy'] as FlavorTag[], ingredients: ['Rice batter', 'Urad dal', 'Potato', 'Mustard seeds'] },
  lunch: { id: 'l1', name: 'Dal Tadka & Rice', tags: ['Balanced'] as FlavorTag[], ingredients: ['Toor dal', 'Basmati rice', 'Tomato', 'Ghee'] },
  snack: { id: 's1', name: 'Mango Lassi', tags: ['Sweet'] as FlavorTag[], ingredients: ['Yogurt', 'Mango pulp', 'Sugar', 'Cardamom'] },
  dinner: { id: 'd1', name: 'Palak Paneer & Roti', tags: ['Light', 'Balanced'] as FlavorTag[], ingredients: ['Spinach', 'Paneer', 'Whole wheat flour', 'Cream'] },
};

export const allMeals: Meal[] = [
  { id: 'm1', name: 'Poha', tags: ['Light'], ingredients: ['Flattened rice', 'Onion', 'Peanuts', 'Turmeric', 'Curry leaves'] },
  { id: 'm2', name: 'Idli Sambar', tags: ['Light', 'Balanced'], ingredients: ['Rice', 'Urad dal', 'Toor dal', 'Vegetables', 'Tamarind'] },
  { id: 'm3', name: 'Chole Bhature', tags: ['Spicy'], ingredients: ['Chickpeas', 'Maida', 'Onion', 'Tomato', 'Spices'] },
  { id: 'm4', name: 'Khichdi', tags: ['Light', 'Balanced'], ingredients: ['Rice', 'Moong dal', 'Ghee', 'Cumin', 'Turmeric'] },
  { id: 'm5', name: 'Aloo Paratha', tags: ['Spicy', 'Balanced'], ingredients: ['Whole wheat flour', 'Potato', 'Green chili', 'Coriander'] },
  { id: 'm6', name: 'Gulab Jamun', tags: ['Sweet'], ingredients: ['Khoya', 'Maida', 'Sugar', 'Cardamom', 'Rose water'] },
  { id: 'm7', name: 'Upma', tags: ['Light'], ingredients: ['Semolina', 'Mustard seeds', 'Curry leaves', 'Onion', 'Green chili'] },
  { id: 'm8', name: 'Rajma Chawal', tags: ['Spicy', 'Balanced'], ingredients: ['Kidney beans', 'Basmati rice', 'Tomato', 'Onion', 'Spices'] },
  { id: 'm9', name: 'Gajar Halwa', tags: ['Sweet'], ingredients: ['Carrot', 'Milk', 'Sugar', 'Ghee', 'Cardamom', 'Nuts'] },
  { id: 'm10', name: 'Vegetable Biryani', tags: ['Spicy', 'Balanced'], ingredients: ['Basmati rice', 'Mixed vegetables', 'Yogurt', 'Saffron', 'Spices'] },
  { id: 'm11', name: 'Pav Bhaji', tags: ['Spicy'], ingredients: ['Mixed vegetables', 'Pav bread', 'Butter', 'Pav bhaji masala'] },
  { id: 'm12', name: 'Dhokla', tags: ['Light', 'Sweet'], ingredients: ['Besan', 'Yogurt', 'Eno', 'Mustard seeds', 'Green chili'] },
];

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
  {
    date: '2026-04-07',
    items: [
      { name: 'Paneer', quantity: '500 g', change: '+500 g' },
      { name: 'Spinach', quantity: '2 bunch', change: '+2 bunch' },
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
