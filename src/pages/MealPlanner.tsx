import { useState, useMemo } from 'react';
import { useNutriMom } from '@/context/NutriMomContext';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import type { MealSlot, Recipe } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check, Clock, X, Calendar, Sparkles } from 'lucide-react';

const MealPlanner = () => {
  const { recipes, getMealPlan, setMealForSlot, toggleMealComplete } = useNutriMom();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingSlot, setSelectingSlot] = useState<MealSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const dateStr = currentDate.toISOString().split('T')[0];
  const plan = getMealPlan(dateStr);
  const dateDisplay = currentDate.toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const isToday = dateStr === new Date().toISOString().split('T')[0];

  const navigateDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  // Week days for quick navigation
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const getRecipeForSlot = (slot: MealSlot): Recipe | null => {
    const recipeId = plan?.meals[slot];
    if (!recipeId) return null;
    return recipes.find(r => r.id === recipeId) || null;
  };

  const filteredRecipesForSlot = useMemo(() => {
    if (!selectingSlot) return [];
    return recipes.filter(r => {
      if (r.mealSlot !== selectingSlot) return false;
      if (searchQuery) {
        return r.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [selectingSlot, recipes, searchQuery]);

  const completedCount = plan?.completedMeals.length || 0;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar size={22} className="text-emerald-500" />
          Meal Plan
        </h1>
      </div>

      {/* Date Navigation */}
      <GlassCard className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigateDay(-1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={16} className="text-gray-600 dark:text-slate-400" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200">{dateDisplay}</h2>
            {isToday && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Today</span>}
          </div>
          <button onClick={() => navigateDay(1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight size={16} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Week View */}
        <div className="flex justify-between">
          {weekDays.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            const isSelected = dayStr === dateStr;
            const dayPlan = getMealPlan(dayStr);
            const dayCompleted = dayPlan?.completedMeals.length || 0;

            return (
              <button
                key={dayStr}
                onClick={() => setCurrentDate(day)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all",
                  isSelected ? "bg-emerald-500 text-white" : "hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <span className={cn("text-[9px] font-medium uppercase", isSelected ? "text-emerald-100" : "text-gray-400 dark:text-slate-500")}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </span>
                <span className={cn("text-sm font-bold", isSelected ? "text-white" : "text-gray-700 dark:text-slate-300")}>
                  {day.getDate()}
                </span>
                {dayCompleted > 0 && (
                  <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-emerald-400")} />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{completedCount}/5</span>
      </div>

      {/* Meal Slots */}
      <div className="space-y-2.5">
        {MEAL_SLOT_CONFIG.map(slot => {
          const recipe = getRecipeForSlot(slot.key);
          const isComplete = plan?.completedMeals.includes(slot.key);

          return (
            <div
              key={slot.key}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all",
                isComplete
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/60"
                  : recipe
                    ? "bg-white/70 dark:bg-slate-900/70 border-white/40 dark:border-slate-800"
                    : "bg-white/50 dark:bg-slate-900/50 border-dashed border-gray-200 dark:border-slate-700/80"
              )}
            >
              <div className="p-3.5 flex items-center gap-3">
                <button
                  onClick={() => toggleMealComplete(dateStr, slot.key)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all",
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700"
                  )}
                >
                  {isComplete ? <Check size={18} strokeWidth={3} /> : slot.emoji}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">{slot.label}</h3>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{slot.time}</span>
                  </div>
                  {recipe ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={cn("text-xs truncate", isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-gray-600 dark:text-slate-400")}>{recipe.name}</p>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500 shrink-0">
                        <Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectingSlot(slot.key); setSearchQuery(''); }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      + Add recipe
                    </button>
                  )}
                </div>

                {recipe && (
                  <button
                    onClick={() => { setSelectingSlot(slot.key); setSearchQuery(''); }}
                    className="text-[10px] text-gray-400 hover:text-emerald-600 shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Selector Modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setSelectingSlot(null)}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500" />
                  Choose {MEAL_SLOT_CONFIG.find(s => s.key === selectingSlot)?.label}
                </h3>
                <button onClick={() => setSelectingSlot(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto p-4 pb-8 space-y-2 flex-1">
              {filteredRecipesForSlot.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No recipes for this meal slot.</p>
              ) : (
                filteredRecipesForSlot.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => {
                      setMealForSlot(dateStr, selectingSlot, recipe.id);
                      setSelectingSlot(null);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{recipe.cuisineName === 'Indian' ? '🇮🇳' : recipe.cuisineName === 'Chinese' ? '🇨🇳' : recipe.cuisineName === 'Italian' ? '🇮🇹' : '🇯🇵'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{recipe.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{recipe.cuisineName}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                            <Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
