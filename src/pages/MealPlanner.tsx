import { useState, useMemo } from 'react';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { useGrocery } from '@/context/GroceryContext';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import type { MealSlot, Recipe } from '@/lib/types';
import { scaleIngredients } from '@/lib/recipeScaler';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, ChevronDown, Check, Clock, X, Calendar, Sparkles,
  Minus, Plus, Users, Download, ShoppingCart, CookingPot, Loader2, ChefHat
} from 'lucide-react';
import { downloadRecipePDF } from '@/lib/recipePdfGenerator';
import WeekPlanPreview from '@/components/WeekPlanPreview';
import CookingMode from '@/components/CookingMode';
import { generateWeekPlan, type WeekPlanResult } from '@/lib/aiWeekPlanner';

const MealPlanner = () => {
  const {
    recipes, getMealPlan, setMealForSlot, toggleMealComplete,
    setServingsForSlot, getServingsForSlot, getRecipesBySlot, mealPlans,
  } = useMealPlanner();
  const { deductIngredients } = useGrocery();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingSlot, setSelectingSlot] = useState<MealSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSlot, setExpandedSlot] = useState<MealSlot | null>(null);
  const [selectorTab, setSelectorTab] = useState<'all' | 'recent'>('all');

  const [showWeekPreview, setShowWeekPreview] = useState(false);
  const [weekPreviewData, setWeekPreviewData] = useState<WeekPlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState<{recipe: Recipe, servings: number, slot: MealSlot} | null>(null);
  
  const { items: inventory } = useGrocery();
  const { activeProfile } = useMealPlanner();

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
    setExpandedSlot(null);
  };

  // Week days for quick navigation
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
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

  const recentCompletedRecipes = useMemo(() => {
    const plansList = Object.values(mealPlans).sort((a,b) => b.date.localeCompare(a.date));
    const recentIds = new Set<string>();
    for (const p of plansList) {
      if (p.completedMeals.length > 0) {
        p.completedMeals.forEach(slot => {
          if (p.meals[slot]) recentIds.add(p.meals[slot]!);
        });
      }
    }
    return Array.from(recentIds).slice(0, 10).map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];
  }, [mealPlans, recipes]);

  const displayRecipes = selectorTab === 'recent' 
    ? recentCompletedRecipes.filter(r => r.mealSlot === selectingSlot || !selectingSlot)
    : filteredRecipesForSlot;

  const completedCount = plan?.completedMeals.length || 0;
  const assignedCount = MEAL_SLOT_CONFIG.filter(s => getRecipeForSlot(s.key)).length;

  // Handle mark-complete with scaled grocery deduction
  const handleMealCompletion = (slotKey: MealSlot) => {
    const isCurrentlyComplete = plan?.completedMeals.includes(slotKey);
    // If marking as complete (not un-completing), deduct scaled ingredients
    if (!isCurrentlyComplete && plan?.meals[slotKey]) {
      const recipe = recipes.find(r => r.id === plan.meals[slotKey]);
      if (recipe) {
        const servings = getServingsForSlot(dateStr, slotKey);
        const scaled = scaleIngredients(recipe.ingredients, recipe.servings, servings);
        deductIngredients(scaled.map(ing => ({
          name: ing.name, quantity: ing.quantity, unit: ing.unit,
        })));
      }
    }
    toggleMealComplete(dateStr, slotKey);
  };

  const handlePlanWeek = async () => {
    setIsPlanning(true);
    try {
      const data = await generateWeekPlan({
        startDate: dateStr,
        inventory: inventory.filter(i => i.status === 'available'),
        recipes,
        deficiencies: activeProfile.deficiencies || [],
        profileType: activeProfile.profileType || 'general health'
      });
      setWeekPreviewData(data);
      setShowWeekPreview(true);
    } catch (e: any) {
      alert(e.message || 'Failed to generate plan');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApplyWeekPlan = (data: WeekPlanResult) => {
    Object.entries(data).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([slot, recipeId]) => {
        if (recipeId) setMealForSlot(day, slot as MealSlot, recipeId);
      });
    });
    setShowWeekPreview(false);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar size={22} className="text-emerald-500" />
          Meal Plan
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePlanWeek} 
            disabled={isPlanning}
            className="text-[11px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1"
          >
            {isPlanning ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {isPlanning ? 'Planning...' : 'Plan My Week'}
          </button>
          <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <CookingPot size={12} className="text-emerald-500" />
            {completedCount}/{assignedCount} cooked
          </div>
        </div>
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
                onClick={() => { setCurrentDate(day); setExpandedSlot(null); }}
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

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
            style={{ width: `${assignedCount > 0 ? (completedCount / assignedCount) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{completedCount}/{assignedCount}</span>
      </div>

      {/* Meal Slots */}
      <div className="space-y-2.5">
        {MEAL_SLOT_CONFIG.map(slot => {
          const recipe = getRecipeForSlot(slot.key);
          const isComplete = plan?.completedMeals.includes(slot.key);
          const isExpanded = expandedSlot === slot.key && !!recipe;
          const servings = getServingsForSlot(dateStr, slot.key);

          return (
            <div
              key={slot.key}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-200",
                isComplete
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/60"
                  : recipe
                    ? "bg-white/70 dark:bg-slate-900/70 border-white/40 dark:border-slate-800"
                    : "bg-white/50 dark:bg-slate-900/50 border-dashed border-gray-200 dark:border-slate-700/80",
                isExpanded && "shadow-lg border-emerald-200 dark:border-emerald-800"
              )}
            >
              {/* Collapsed Header */}
              <div
                className="p-3.5 flex items-center gap-3 cursor-pointer"
                onClick={() => recipe && setExpandedSlot(isExpanded ? null : slot.key)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); if (recipe) handleMealCompletion(slot.key); }}
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
                      onClick={(e) => { e.stopPropagation(); setSelectingSlot(slot.key); setSearchQuery(''); }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      + Add recipe
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {recipe && servings !== recipe.servings && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Users size={10} /> ×{servings}
                    </span>
                  )}
                  {recipe && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectingSlot(slot.key); setSearchQuery(''); }}
                      className="text-[10px] text-gray-400 hover:text-emerald-600 shrink-0 px-1"
                    >
                      Change
                    </button>
                  )}
                  {recipe && (
                    isExpanded
                      ? <ChevronDown size={16} className="text-emerald-500" />
                      : <ChevronRight size={16} className="text-gray-300 dark:text-slate-600" />
                  )}
                </div>
              </div>

              {/* Expanded Card — Servings + Ingredients + Instructions */}
              {isExpanded && recipe && (() => {
                const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);
                const isScaled = servings !== recipe.servings;
                return (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40" onClick={e => e.stopPropagation()}>
                    {/* ── Servings Stepper ── */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-xl px-4 py-3 mb-4 border border-emerald-100 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                          Cooking for
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setServingsForSlot(dateStr, slot.key, servings - 1)}
                          disabled={servings <= 1}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            servings <= 1
                              ? "bg-gray-100 text-gray-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                              : "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm hover:shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 border border-emerald-100 dark:border-emerald-800"
                          )}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 min-w-[2ch] text-center tabular-nums">
                          {servings}
                        </span>
                        <button
                          onClick={() => setServingsForSlot(dateStr, slot.key, servings + 1)}
                          disabled={servings >= 20}
                          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm hover:shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center transition-all"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {isScaled && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mb-3 flex items-center gap-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                        <ShoppingCart size={11} />
                        Quantities scaled from {recipe.servings} → {servings} {servings === 1 ? 'serving' : 'servings'}
                      </div>
                    )}

                    {/* ── Ingredients ── */}
                    <div className="mb-4">
                      <h4 className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Ingredients
                      </h4>
                      <ul className="space-y-1.5">
                        {scaledIngredients.map((ing, idx) => (
                          <li key={idx} className="flex justify-between items-center text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm border border-gray-50 dark:border-slate-700 px-2.5 py-1.5 rounded-lg">
                            <span>
                              {ing.name}
                              {ing.nameInTamil && ing.nameInTamil !== ing.name && (
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">({ing.nameInTamil})</span>
                              )}
                            </span>
                            <span className={cn(
                              "font-semibold px-1.5 py-0.5 rounded",
                              isScaled ? "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40" : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            )}>
                              {ing.quantity} {ing.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ── Instructions ── */}
                    <div className="mb-4">
                      <h4 className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Preparation Steps
                      </h4>
                      <ul className="space-y-2">
                        {recipe.instructions.map((inst, idx) => (
                          <li key={idx} className="flex gap-2.5 text-xs text-gray-700 dark:text-slate-300 items-start">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[10px] border border-emerald-200 dark:border-emerald-800">
                              {inst.stepNumber}
                            </span>
                            <div className="flex-1 mt-0.5 leading-relaxed">
                              {inst.text}
                              {inst.durationMinutes && (
                                <span className="ml-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 rounded-sm">
                                  {inst.durationMinutes}m
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex flex-col gap-2">
                       <button
                         onClick={(e) => { e.stopPropagation(); setCookingRecipe({ recipe, servings, slot: slot.key }); }}
                         className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                       >
                         <ChefHat size={18} /> Start Cooking Mode
                       </button>

                      <div className="flex gap-2">
                        {!isComplete ? (
                          <button
                            onClick={() => handleMealCompletion(slot.key)}
                            className="flex-1 py-3 mt-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-1.5 border border-gray-200 dark:border-slate-700"
                          >
                            <Check size={14} strokeWidth={2.5} /> Skip & Mark Complete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMealCompletion(slot.key)}
                            className="flex-1 py-3 mt-1 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/50"
                          >
                            <X size={14} strokeWidth={2.5} /> Mark Incomplete
                          </button>
                        )}
                        <button
                          onClick={() => downloadRecipePDF(recipe)}
                          className="py-3 px-4 mt-1 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all flex items-center justify-center shrink-0"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Recipe Selector Modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setSelectingSlot(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden animate-fade-in border-t border-white/40 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500" />
                  Choose {MEAL_SLOT_CONFIG.find(s => s.key === selectingSlot)?.label}
                </h3>
                <button onClick={() => setSelectingSlot(null)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                  <X size={16} className="text-gray-500 dark:text-slate-400" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:text-slate-200"
                autoFocus
              />
              <div className="flex px-4 mt-3 gap-4 border-b border-gray-100 dark:border-slate-800 -mx-4">
                 <button onClick={() => setSelectorTab('all')} className={cn("pb-2 text-sm font-semibold border-b-2 transition-all", selectorTab === 'all' ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-gray-500 dark:text-slate-400")}>All Recipes</button>
                 <button onClick={() => setSelectorTab('recent')} className={cn("pb-2 text-sm font-semibold border-b-2 transition-all", selectorTab === 'recent' ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-gray-500 dark:text-slate-400")}>Cook Again (Recent)</button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 pb-8 space-y-2 flex-1">
              {displayRecipes.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No recipes found.</p>
              ) : (
                displayRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => {
                      setMealForSlot(dateStr, selectingSlot, recipe.id);
                      setSelectingSlot(null);
                      setExpandedSlot(selectingSlot);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{recipe.cuisineName === 'Indian' ? '🇮🇳' : recipe.cuisineName === 'Chinese' ? '🇨🇳' : recipe.cuisineName === 'Italian' ? '🇮🇹' : '🇯🇵'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{recipe.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 dark:text-slate-500">{recipe.cuisineName}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                            <Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                            <Users size={10} /> {recipe.servings}
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

      {showWeekPreview && weekPreviewData && (
        <WeekPlanPreview 
          planData={weekPreviewData} 
          onApply={handleApplyWeekPlan} 
          onCancel={() => setShowWeekPreview(false)} 
        />
      )}

      {cookingRecipe && (
        <CookingMode
          recipe={cookingRecipe.recipe}
          servings={cookingRecipe.servings}
          onClose={() => setCookingRecipe(null)}
          onMarkComplete={() => {
            if (!plan?.completedMeals.includes(cookingRecipe.slot)) {
               handleMealCompletion(cookingRecipe.slot);
            }
          }}
        />
      )}
    </div>
  );
};

export default MealPlanner;
