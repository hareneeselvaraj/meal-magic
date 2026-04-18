import { useState, useEffect, useMemo } from 'react';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { useGrocery } from '@/context/GroceryContext';
import { healthTips } from '@/data/seedData';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import AIMealSuggestions from '@/components/AIMealSuggestions';
import NutritionSummary from '@/components/NutritionSummary';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Heart, Sun, Moon, Leaf, User, Bell, AlertTriangle, Utensils, CalendarDays, ChevronRight, Clock } from 'lucide-react';
import { getLowStockItems, getCookableRecipes } from '@/lib/shoppingList';

interface HomeProps {
  onOpenProfile?: () => void;
  onNavigateToPlan?: () => void;
}

const Home = ({ onOpenProfile, onNavigateToPlan }: HomeProps) => {
  const { activeProfile, recipes, mealPlans, getMealPlan } = useMealPlanner();
  const { items: inventory } = useGrocery();

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dateDisplay = today.toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const todayPlan = getMealPlan(todayStr);
  const completedCount = todayPlan?.completedMeals.length || 0;

  // Grocery Dashboard Widgets
  const lowStockItems = useMemo(() => getLowStockItems(inventory), [inventory]);
  const cookableRecipes = useMemo(() => getCookableRecipes(recipes, inventory).slice(0, 3), [recipes, inventory]);

  const dailyTip = useMemo(() => {
    let relevant = healthTips;
    if (activeProfile.deficiencies?.length > 0) {
      const match = healthTips.filter(t => t.forDeficiencies?.some(d => activeProfile.deficiencies.includes(d)));
      if (match.length > 0) relevant = match;
    }
    const dayIndex = today.getDate() % relevant.length;
    return relevant[dayIndex] || healthTips[0];
  }, [activeProfile.deficiencies]);

  // Resolve planned recipe names for today
  const todayMeals = useMemo(() => {
    return MEAL_SLOT_CONFIG.map(slot => {
      const recipeId = todayPlan?.meals[slot.key];
      const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
      const isComplete = todayPlan?.completedMeals.includes(slot.key) ?? false;
      return { slot, recipe, isComplete };
    });
  }, [todayPlan, recipes]);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Count how many meals have recipes assigned
  const assignedCount = todayMeals.filter(m => m.recipe).length;

  const favoriteRecipes = useMemo(() => recipes.filter(r => r.isFavourite), [recipes]);

  return (
    <div className="space-y-5 pb-8 relative dark:text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all touch-manipulation shrink-0"
            >
              <User size={18} strokeWidth={2.5} />
            </button>
            <h1 className="text-xl leading-tight font-bold text-foreground">
              {getGreeting()},<br />Plan your meal
            </h1>
          </div>
          <p className="text-sm text-foreground/50 ml-12">{dateDisplay}</p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/40 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-all touch-manipulation"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Health Tip Card */}
      <GlassCard className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200/50 dark:border-emerald-900/50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{dailyTip.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Health Tip</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{dailyTip.text}</p>
          </div>
        </div>
      </GlassCard>

      {/* Daily Progress */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Leaf size={18} className="text-emerald-500" />
            Today's Progress
          </h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
            {completedCount}/{assignedCount || 0} done
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${assignedCount > 0 ? (completedCount / assignedCount) * 100 : 0}%` }}
          />
        </div>
      </GlassCard>

      {/* Favorites Row */}
      {favoriteRecipes.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Heart size={18} className="text-rose-500 fill-current" />
              Your Favourites
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none">
            {favoriteRecipes.map(recipe => (
              <div key={recipe.id} onClick={onNavigateToPlan} className="min-w-[200px] max-w-[220px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-white/40 dark:border-slate-800 rounded-2xl p-3 shrink-0 cursor-pointer hover:border-emerald-200 transition-all group">
                 <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">{recipe.name}</h3>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">{recipe.cuisineName || 'Mix'}</span>
                   <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium"><Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Meals — Read-only overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Heart size={18} className="text-rose-400" />
            Today's Meals
          </h2>
          <button
            onClick={onNavigateToPlan}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <CalendarDays size={12} /> Manage in Plan
          </button>
        </div>
        <div className="space-y-2">
          {todayMeals.map(({ slot, recipe, isComplete }) => (
            <div
              key={slot.key}
              onClick={recipe ? undefined : onNavigateToPlan}
              className={cn(
                "rounded-2xl border p-3.5 flex items-center gap-3 transition-all duration-200",
                isComplete
                  ? "bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-800/60"
                  : recipe
                    ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/40 dark:border-slate-800"
                    : "bg-white/40 dark:bg-slate-900/40 border-dashed border-gray-200 dark:border-slate-700 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-800"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0",
                isComplete ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-gray-50 dark:bg-slate-800"
              )}>
                {isComplete ? <Check size={18} strokeWidth={3} className="text-emerald-600" /> : slot.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">{slot.label}</h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{slot.time}</span>
                </div>
                {recipe ? (
                  <p className={cn("text-xs mt-0.5 truncate", isComplete ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-gray-600 dark:text-slate-400")}>
                    {recipe.name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-slate-500 italic mt-0.5 flex items-center gap-1">
                    No recipe linked — <span className="text-emerald-500 font-medium">tap to plan</span>
                  </p>
                )}
              </div>
              {!recipe && <ChevronRight size={16} className="text-gray-300 dark:text-slate-600 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <AIMealSuggestions />
      <NutritionSummary />

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-2 gap-3">
        {/* Low Stock Alert */}
        <GlassCard className="p-3 bg-gradient-to-br from-rose-50/50 dark:from-rose-950/30 to-orange-50/50 dark:to-orange-950/30 border-rose-200/40 dark:border-rose-900/30">
          <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-rose-500" /> Low Stock
          </h3>
          {lowStockItems.length === 0 ? (
            <p className="text-[10px] text-gray-500 dark:text-slate-500">Pantry is fully stocked!</p>
          ) : (
            <div className="space-y-1.5 text-[10px]">
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex justify-between items-center text-gray-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 px-1.5 py-1 rounded border border-rose-100 dark:border-rose-900/50">
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{item.quantity}{item.unit}</span>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <div className="text-center text-gray-400 dark:text-slate-500 font-medium pt-1">+{lowStockItems.length - 3} more</div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Cookable Right Now */}
        <GlassCard className="p-3 bg-gradient-to-br from-amber-50/50 dark:from-amber-950/30 to-yellow-50/50 dark:to-yellow-950/30 border-amber-200/40 dark:border-amber-900/30">
          <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
            <Utensils size={12} className="text-amber-500" /> Cookable Now
          </h3>
          {cookableRecipes.length === 0 ? (
            <p className="text-[10px] text-gray-500 dark:text-slate-500">Need groceries to cook.</p>
          ) : (
            <div className="space-y-1.5 text-[10px]">
              {cookableRecipes.map(recipe => (
                <div key={recipe.id} className="text-gray-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 px-1.5 py-1 rounded truncate border border-amber-100 dark:border-amber-900/50 font-medium">
                  {recipe.name}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Nutrition Deficiency Badges */}
      {activeProfile.deficiencies.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <span className="text-base">⚠️</span> Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeProfile.deficiencies.map(def => (
              <span
                key={def}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium border",
                  def === 'iron' && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50",
                  def === 'vitamin_d' && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
                  def === 'ferritin' && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50",
                  def === 'b12' && "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50",
                  def === 'calcium' && "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/50",
                )}
              >
                {def.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Home;
