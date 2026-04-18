import { useState, useEffect } from 'react';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { calculateDailyNutrition, type NutritionResult } from '@/lib/nutritionCalculator';
import GlassCard from './GlassCard';
import { Sparkles, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEAL_SLOT_CONFIG } from '@/lib/types';

export default function NutritionSummary() {
  const { mealPlans, recipes, activeProfile } = useMealPlanner();
  const [nutrition, setNutrition] = useState<NutritionResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const todayPlan = mealPlans[today];
  const completedCount = todayPlan?.completedMeals.length || 0;
  
  const TARGETS = {
    calories: 2200,
    protein_g: 70,
    iron_mg: 27,        // Pregnancy focus
    calcium_mg: 1000,
    folate_mcg: 600,
    fiber_g: 28
  };

  useEffect(() => {
    // Only calculate if at least 2 meals are completed to save API calls
    if (completedCount >= 2) {
      const runCalc = async () => {
        setLoading(true);
        try {
          const meals = todayPlan.completedMeals.map(slotKey => {
            const recipeId = todayPlan.meals[slotKey];
            const recipe = recipes.find(r => r.id === recipeId);
            const servings = todayPlan.servingsPerSlot[slotKey] || 1;
            return {
              slot: MEAL_SLOT_CONFIG.find(s => s.key === slotKey)?.label || slotKey,
              recipeName: recipe?.name || 'Unknown Mix',
              servings
            };
          });
          
          const result = await calculateDailyNutrition({
            meals,
            profileType: activeProfile.profileType
          });
          setNutrition(result);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      // Run automatically once
      if (!nutrition && !loading) {
         runCalc();
      }
    }
  }, [completedCount]);

  if (completedCount < 2) return null;

  return (
    <GlassCard className="p-4 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-950/30 to-purple-50/50 dark:to-purple-950/30 border-indigo-200/40 dark:border-indigo-900/40">
      <h3 className="font-bold flex items-center justify-between mb-3 text-indigo-900 dark:text-indigo-200">
        <span className="flex items-center gap-2">
          <Activity size={18} className="text-indigo-500" />
          Today's Nutrition <span className="text-[10px] font-normal bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded ml-1">AI Est.</span>
        </span>
      </h3>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-indigo-400">
          <Loader2 size={24} className="animate-spin mb-2" />
          <p className="text-xs font-semibold">Calculating nutrients...</p>
        </div>
      ) : nutrition ? (
        <div className="space-y-3">
          {[
            { key: 'calories', label: 'Calories', val: nutrition.calories, target: TARGETS.calories, unit: '' },
            { key: 'protein_g', label: 'Protein', val: nutrition.protein_g, target: TARGETS.protein_g, unit: 'g' },
            { key: 'iron_mg', label: 'Iron', val: nutrition.iron_mg, target: TARGETS.iron_mg, unit: 'mg', def: 'iron' },
            { key: 'calcium_mg', label: 'Calcium', val: nutrition.calcium_mg, target: TARGETS.calcium_mg, unit: 'mg', def: 'calcium' },
            { key: 'folate_mcg', label: 'Folate', val: nutrition.folate_mcg, target: TARGETS.folate_mcg, unit: 'mcg', def: 'folic_acid' },
          ].map(stat => {
            const pct = Math.min(100, Math.max(0, Math.round((stat.val / stat.target) * 100)));
            const isDeficient = stat.def && activeProfile.deficiencies?.includes(stat.def);
            const warningDrop = isDeficient && pct < 60;
            return (
              <div key={stat.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={cn("font-medium", warningDrop ? "text-rose-600 dark:text-rose-400 font-bold" : "text-gray-700 dark:text-slate-300")}>
                    {stat.label} {warningDrop && <AlertTriangle size={10} className="inline mb-0.5" />}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-slate-200">
                    {stat.val}{stat.unit} <span className="text-[10px] text-gray-400 font-normal ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      warningDrop 
                        ? "bg-rose-500" 
                        : pct >= 100 
                          ? "bg-emerald-500" 
                          : "bg-indigo-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[9px] text-gray-400 dark:text-slate-500 text-center italic mt-2 opacity-80">
            Powered by Gemini AI based on {completedCount} logged meals.
          </p>
        </div>
      ) : null}
    </GlassCard>
  );
}
