import { useState } from 'react';
import { suggestMeals, type MealSuggestion } from '@/lib/aiMealSuggester';
import { useGrocery } from '@/context/GroceryContext';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { Loader2, Sparkles, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

export default function AIMealSuggestions() {
  const { items } = useGrocery();
  const { activeProfile, mealPlans, recipes } = useMealPlanner();
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Gather inventory (only available strings)
      const inventory = items.filter(i => i.status === 'available').map(i => i.name);
      
      // 2. Gather recent meals from past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentRecipes = new Set<string>();
      Object.values(mealPlans).forEach(plan => {
        if (new Date(plan.date) >= oneWeekAgo) {
           Object.values(plan.meals).forEach(rId => {
             if (rId) {
                const recipe = recipes.find(r => r.id === rId);
                if (recipe) recentRecipes.add(recipe.name);
             }
           });
        }
      });
      
      const hour = new Date().getHours();
      const timeOfDay = hour < 10 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : 'evening';

      const results = await suggestMeals({
        inventory,
        healthFocus: activeProfile.profileType || 'general health',
        deficiencies: activeProfile.deficiencies || [],
        recentMeals: Array.from(recentRecipes),
        timeOfDay
      });
      
      setSuggestions(results);
    } catch (e: any) {
      setError(e.message || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-6 mb-4">
      {suggestions.length === 0 && !loading && (
        <button 
          onClick={handleSuggest}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95"
        >
          <Sparkles size={20} className="text-emerald-100" /> 
          Suggest meals for today
        </button>
      )}

      {loading && (
        <div className="w-full py-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
          <p className="text-sm font-semibold text-emerald-800 animate-pulse">Designing your menu with Gemini AI...</p>
        </div>
      )}

      {error && (
         <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
           {error}
           <button onClick={() => setError(null)} className="underline ml-2">Dismiss</button>
         </div>
      )}

      {suggestions.length > 0 && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              AI Suggestions
            </h3>
            <button onClick={() => setSuggestions([])} className="text-xs font-semibold text-emerald-600">Clear</button>
          </div>
          
          <div className="grid gap-3">
            {suggestions.map((meal, idx) => (
              <GlassCard key={idx} className="p-4 border-l-[3px] border-emerald-400 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles size={40} />
                </div>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-[15px] text-gray-800 dark:text-slate-200 leading-tight">
                      {meal.recipeName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                      <Info size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                      {meal.whyItHelps}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-white/60 dark:bg-slate-800 py-1 px-2 rounded flex items-center gap-1 text-slate-500">
                    <Clock size={12} /> {meal.timeEstimate}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
