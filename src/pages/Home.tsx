import { useState, useEffect, useMemo } from 'react';
import { useNutriMom } from '@/context/NutriMomContext';
import { useGrocery, type IngredientCheck } from '@/context/GroceryContext';
import { healthTips } from '@/data/seedData';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import type { MealSlot } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { Clock, Check, ChevronRight, ChevronDown, Sparkles, Heart, Sun, Moon, Leaf, User, Bell, Download, X, Link } from 'lucide-react';
import { downloadGroceryListPDF } from '@/lib/groceryPdfGenerator';
import { downloadRecipePDF } from '@/lib/recipePdfGenerator';

interface HomeProps {
  onOpenProfile?: () => void;
  onNavigateToPlan?: () => void;
}

const Home = ({ onOpenProfile, onNavigateToPlan }: HomeProps) => {
  const { activeProfile, recipes, mealPlans, toggleMealComplete, getMealPlan, setMealForSlot, getRecipesBySlot } = useNutriMom();
  const { deductIngredients, checkIngredientAvailability } = useGrocery();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({});
  const [selectionModalSlot, setSelectionModalSlot] = useState<MealSlot | null>(null);
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

  const dailyTip = useMemo(() => {
    const relevant = healthTips.filter(t =>
      t.forProfiles.includes(activeProfile.profileType)
    );
    const dayIndex = today.getDate() % relevant.length;
    return relevant[dayIndex] || healthTips[0];
  }, [activeProfile.profileType]);

  const suggestions = useMemo(() => {
    const result: Record<string, typeof recipes[0] | null> = {};
    MEAL_SLOT_CONFIG.forEach(slot => {
      const assignedId = todayPlan?.meals[slot.key];
      if (assignedId) {
        result[slot.key] = recipes.find(r => r.id === assignedId) || null;
      } else {
        // Remove random fallback suggestions as requested by the user
        result[slot.key] = null;
      }
    });
    return result;
  }, [todayPlan, recipes]);

  // Compute ingredient alerts for planned meals
  const ingredientAlerts = useMemo(() => {
    let alerts: IngredientCheck[] = [];
    if (!todayPlan) return alerts;

    // Only check recipes that are explicitly assigned AND not yet completed
    Object.entries(todayPlan.meals).forEach(([slotKey, recipeId]) => {
      if (recipeId && !todayPlan.completedMeals.includes(slotKey as MealSlot)) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          const checks = checkIngredientAvailability(recipe.name, recipe.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit
          })));
          alerts = [...alerts, ...checks];
        }
      }
    });
    return alerts;
  }, [todayPlan, recipes, checkIngredientAvailability]);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleMealCompletion = (slotKey: MealSlot) => {
    const isCurrentlyComplete = todayPlan?.completedMeals.includes(slotKey);
    // If we are MARKing it as complete (not un-completing), and it has a planned recipe, deduct groceries
    if (!isCurrentlyComplete && todayPlan?.meals[slotKey]) {
      const recipe = recipes.find(r => r.id === todayPlan.meals[slotKey]);
      if (recipe) {
        deductIngredients(recipe.ingredients.map(ing => ({
          name: ing.name, quantity: ing.quantity, unit: ing.unit
        })));
      }
    }
    toggleMealComplete(todayStr, slotKey);
  };

  const unseenAlertCount = ingredientAlerts.length;

  return (
    <div className="space-y-5 pb-8 relative">
      {/* Header - Profile Left, Notifications/Theme Right */}
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

        <div className="flex items-center gap-2 mt-1 relative z-50">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white text-gray-500 transition-all touch-manipulation"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white text-gray-700 transition-all touch-manipulation relative"
          >
            <Bell size={20} className={unseenAlertCount > 0 ? "text-rose-500" : ""} />
            {unseenAlertCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-slate-50">
                {unseenAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-900/10 border border-white z-50 overflow-hidden transform transition-all origin-top-right">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Bell size={16} className="text-emerald-500" /> Ingredient Alerts
                </h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {ingredientAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    <Check size={24} className="mx-auto mb-2 text-emerald-400 opacity-50" />
                    You have all ingredients for your planned meals!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {ingredientAlerts.map((alert, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-emerald-600">{alert.recipeName}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            alert.status === 'missing' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {alert.status}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">{alert.ingredientName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>Need: {alert.requiredQty} {alert.requiredUnit}</span>
                          {alert.availableQty > 0 && <span>Have: {alert.availableQty} {alert.availableUnit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ingredientAlerts.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => {
                      downloadGroceryListPDF(ingredientAlerts);
                      setShowNotifications(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Download size={16} /> Download Grocery List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Health Tip Card */}
      <GlassCard className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{dailyTip.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Health Tip</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{dailyTip.text}</p>
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
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {completedCount}/5 meals
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {MEAL_SLOT_CONFIG.map(slot => {
            const isComplete = todayPlan?.completedMeals.includes(slot.key);
            return (
              <button
                key={slot.key}
                onClick={() => handleMealCompletion(slot.key)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all relative z-10",
                  isComplete
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-400 hover:bg-emerald-100"
                )}
                title={slot.label}
              >
                {isComplete ? <Check size={14} strokeWidth={3} /> : slot.emoji}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Meal Slots */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Heart size={18} className="text-rose-400" />
          Today's Meals
        </h2>
        <div className="space-y-2.5">
          {MEAL_SLOT_CONFIG.map(slot => {
            const recipe = suggestions[slot.key];
            const isComplete = todayPlan?.completedMeals.includes(slot.key);

            return (
              <div
                key={slot.key}
                onClick={recipe ? () => setExpandedSlots(prev => ({ ...prev, [slot.key]: !prev[slot.key] })) : onNavigateToPlan}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden relative z-10 cursor-pointer",
                  isComplete
                    ? "bg-emerald-50/80 border-emerald-200/60"
                    : "bg-white/70 backdrop-blur-sm border-white/40 hover:border-emerald-200",
                  recipe && expandedSlots[slot.key] && "shadow-md hover:border-emerald-300"
                )}
              >
                <div className="p-3.5 flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0",
                    isComplete ? "bg-emerald-100" : "bg-gray-50"
                  )}>
                    {slot.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-800">{slot.label}</h3>
                      <span className="text-[10px] text-gray-400">{slot.time}</span>
                    </div>
                    {recipe ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-600 truncate">{recipe.name}</p>
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
                          <Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-0.5">Tap to choose a recipe</p>
                    )}
                    {recipe && recipe.healthTags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {recipe.healthTags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 font-medium">
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMealCompletion(slot.key); }}
                      className="p-1 cursor-pointer"
                    >
                      {isComplete ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check size={12} strokeWidth={3} className="text-white" />
                        </span>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-emerald-400 transition-colors" />
                      )}
                    </button>
                    {!recipe ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectionModalSlot(slot.key); }}
                        className="ml-1 text-emerald-600 bg-emerald-100/80 hover:bg-emerald-200 p-1.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                        title="Link Recipe"
                      >
                        <Link size={14} strokeWidth={2.5} />
                      </button>
                    ) : (
                      expandedSlots[slot.key] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-300" />
                    )}
                  </div>
                </div>

                {recipe && expandedSlots[slot.key] && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white/40 cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Ingredients
                        </h4>
                        <ul className="space-y-1.5">
                          {recipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs text-gray-700 bg-white shadow-sm border border-gray-50 px-2.5 py-1.5 rounded-lg">
                              <span>{ing.name} {ing.nameInTamil && <span className="text-[10px] text-gray-400 ml-1">({ing.nameInTamil})</span>}</span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{ing.quantity} {ing.unit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Instructions
                        </h4>
                        <ul className="space-y-2">
                          {recipe.instructions.map((inst, idx) => (
                            <li key={idx} className="flex gap-2.5 text-xs text-gray-700 items-start">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-[10px] border border-emerald-200">
                                {inst.stepNumber}
                              </span>
                              <div className="flex-1 mt-0.5 leading-relaxed">
                                {inst.text}
                                {inst.durationMinutes && (
                                  <span className="ml-1.5 font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-sm">
                                    {inst.durationMinutes}m
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); downloadRecipePDF(recipe); }}
                        className="w-full mt-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download size={14} /> Download as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
                  def === 'iron' && "bg-rose-50 text-rose-700 border-rose-200",
                  def === 'vitamin_d' && "bg-amber-50 text-amber-700 border-amber-200",
                  def === 'ferritin' && "bg-purple-50 text-purple-700 border-purple-200",
                  def === 'b12' && "bg-sky-50 text-sky-700 border-sky-200",
                  def === 'calcium' && "bg-teal-50 text-teal-700 border-teal-200",
                )}
              >
                {def.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Direct Recipe Selection Modal */}
      {selectionModalSlot && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setSelectionModalSlot(null)}>
          <div className="w-full h-[80vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-white/90 backdrop-blur-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/40 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50 sticky top-0 z-10 shrink-0">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Heart size={18} className="text-rose-400" /> Choose Recipe
              </h3>
              <button onClick={() => setSelectionModalSlot(null)} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1 overscroll-contain">
              <div className="space-y-3 pb-8">
                {getRecipesBySlot(selectionModalSlot).length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">No recipes available for this slot.</p>
                ) : (
                  getRecipesBySlot(selectionModalSlot).map(r => (
                    <div key={r.id} onClick={() => { setMealForSlot(todayStr, selectionModalSlot, r.id); setSelectionModalSlot(null); }} className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <span className="text-xl text-emerald-600">🍽️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{r.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                            <Clock size={12} /> {r.prepTimeMinutes + r.cookTimeMinutes}m
                          </span>
                        </div>
                      </div>
                      <button className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100/80 hover:bg-emerald-200 px-3 py-1.5 rounded-full shrink-0 transition-colors">
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
