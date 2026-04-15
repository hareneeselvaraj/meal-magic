import { useState } from 'react';
import { Plus, Trash2, Flame, Zap, Droplets, Leaf } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const presets = [
  { food: 'Egg Bhurji Toast',    calories: 280, protein: 14, carbs: 32, fat: 10 },
  { food: 'Oats Upma',           calories: 210, protein: 7,  carbs: 38, fat: 4  },
  { food: 'Millet Biryani',      calories: 350, protein: 9,  carbs: 60, fat: 7  },
  { food: 'Rajma Chawal',        calories: 420, protein: 16, carbs: 72, fat: 6  },
  { food: 'Roasted Makhana',     calories: 100, protein: 4,  carbs: 18, fat: 1  },
  { food: 'Fruit Chaat Bowl',    calories: 130, protein: 2,  carbs: 30, fat: 0  },
  { food: 'Masala Dosa',         calories: 290, protein: 6,  carbs: 50, fat: 8  },
  { food: 'Idli + Sambar',       calories: 200, protein: 7,  carbs: 40, fat: 2  },
];

const DAILY_GOALS = { calories: 1800, protein: 60, carbs: 225, fat: 60 };

interface NutrientLogProps {
  onClose: () => void;
}

const NutrientLog = ({ onClose }: NutrientLogProps) => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addEntry = () => {
    if (!food.trim() || !calories) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        food,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        time: timeStr,
      },
    ]);
    setFood(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    setShowPresets(false);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const fillPreset = (p: typeof presets[0]) => {
    setFood(p.food);
    setCalories(String(p.calories));
    setProtein(String(p.protein));
    setCarbs(String(p.carbs));
    setFat(String(p.fat));
    setShowPresets(false);
  };

  const macroBar = (value: number, goal: number, color: string) => {
    const pct = Math.min(100, Math.round((value / goal) * 100));
    return (
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrient Log 🥗</h1>
          <p className="text-sm text-foreground/50">Track today's intake</p>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-emerald-600 font-semibold hover:text-emerald-700"
        >
          ← Back
        </button>
      </div>

      {/* Daily Summary Ring */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Calories', value: totals.calories, goal: DAILY_GOALS.calories, unit: 'kcal', icon: Flame,    color: 'bg-orange-400' },
            { label: 'Protein',  value: totals.protein,  goal: DAILY_GOALS.protein,  unit: 'g',    icon: Zap,     color: 'bg-blue-400'   },
            { label: 'Carbs',    value: totals.carbs,    goal: DAILY_GOALS.carbs,    unit: 'g',    icon: Leaf,    color: 'bg-amber-400'  },
            { label: 'Fat',      value: totals.fat,      goal: DAILY_GOALS.fat,      unit: 'g',    icon: Droplets,color: 'bg-rose-400'   },
          ].map(({ label, value, goal, unit, icon: Icon, color }) => (
            <div key={label} className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white mb-1', color)}>
                <Icon size={14} />
              </div>
              <p className="text-xs font-bold text-gray-800">{value}</p>
              <p className="text-[10px] text-gray-400">{unit}</p>
              <p className="text-[9px] text-gray-400">/ {goal}</p>
              {macroBar(value, goal, color)}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Add Entry Form */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Add Food</h2>
          <button
            onClick={() => setShowPresets((v) => !v)}
            className="text-xs text-emerald-600 font-semibold border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50"
          >
            {showPresets ? 'Hide' : '⚡ Quick Add'}
          </button>
        </div>

        {showPresets && (
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.food}
                onClick={() => fillPreset(p)}
                className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                {p.food}
              </button>
            ))}
          </div>
        )}

        <input
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="Food name (e.g. Dal Rice)"
          className="w-full text-sm px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-400"
        />

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Cal (kcal)', val: calories, set: setCalories },
            { label: 'Protein (g)', val: protein, set: setProtein },
            { label: 'Carbs (g)',   val: carbs,   set: setCarbs   },
            { label: 'Fat (g)',     val: fat,     set: setFat     },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <input
                value={val}
                onChange={(e) => set(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full text-sm px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-400 text-center"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addEntry}
          disabled={!food.trim() || !calories}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={16} /> Log Entry
        </button>
      </GlassCard>

      {/* Logged Entries */}
      {entries.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">Today's Log ({entries.length})</h2>
          <div className="space-y-2">
            {entries.map((entry) => (
              <GlassCard key={entry.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{entry.food}</p>
                  <p className="text-[11px] text-gray-400">
                    {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g · {entry.time}
                  </p>
                </div>
                <button onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm">No entries yet. Log your first meal above!</p>
        </div>
      )}
    </div>
  );
};

export default NutrientLog;
