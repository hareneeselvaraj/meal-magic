import { MEAL_SLOT_CONFIG, type MealSlot, type Recipe } from '@/lib/types';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { type WeekPlanResult } from '@/lib/aiWeekPlanner';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { Check, Calendar } from 'lucide-react';
import { useState } from 'react';

interface WeekPlanPreviewProps {
  planData: WeekPlanResult;
  onApply: (data: WeekPlanResult) => void;
  onCancel: () => void;
}

export default function WeekPlanPreview({ planData, onApply, onCancel }: WeekPlanPreviewProps) {
  const { recipes } = useMealPlanner();
  const [selectedDay, setSelectedDay] = useState<string>(Object.keys(planData)[0]);

  const dates = Object.keys(planData).sort();
  
  const getRecipe = (id: string | null) => {
    if (!id) return null;
    return recipes.find(r => r.id === id) || null;
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-900 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <Calendar size={20} className="text-emerald-500" />
          7-Day Smart Plan
        </h2>
        <button onClick={onCancel} className="text-sm font-semibold text-gray-400 hover:text-gray-600 px-2 py-1">
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 px-4 py-6">
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 font-medium">
          Review your AI-generated weekly plan. Tap "Apply Plan" to save it to your calendar.
        </p>

        {/* Day Selector */}
        <div className="flex overflow-x-auto pb-4 gap-2 snap-x hide-scrollbar mb-2">
          {dates.map((dateStr) => {
            const d = new Date(dateStr);
            const isSelected = selectedDay === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={cn(
                  "flex flex-col items-center min-w-[64px] py-2 px-3 rounded-2xl border snap-center transition-all",
                  isSelected
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                )}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Daily Schedule Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 pl-1">
            Menu for {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}
          </h3>
          {MEAL_SLOT_CONFIG.map(slot => {
            const recipeId = planData[selectedDay]?.[slot.key];
            const recipe = getRecipe(recipeId);

            return (
              <GlassCard key={slot.key} className="p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-lg shrink-0">
                  {slot.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">{slot.label}</span>
                  </div>
                  {recipe ? (
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{recipe.name}</p>
                  ) : (
                    <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">No recipe planned</p>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Footer Footer */}
      <div className="px-4 py-4 pt-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <button
          onClick={() => onApply(planData)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-[15px]"
        >
          <Check size={18} strokeWidth={2.5} /> Apply 7-Day Plan
        </button>
      </div>
    </div>
  );
}
