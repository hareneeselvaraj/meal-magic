import { useState } from 'react';
import { groceryItems, type Recipe, type MealSlot, type FlavorTag } from '@/data/mockData';
import { useRecipes } from '@/context/RecipeContext';
import { checkRecipeAvailability } from '@/lib/groceryChecker';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { Clock, ChevronDown, ChevronUp, ShoppingCart, Check, Filter } from 'lucide-react';

const mealSlotConfig: { slot: MealSlot; label: string; emoji: string; time: string }[] = [
  { slot: 'breakfast', label: 'Breakfast', emoji: '🌅', time: '7 – 9 AM' },
  { slot: 'lunch',     label: 'Lunch',     emoji: '☀️', time: '12 – 2 PM' },
  { slot: 'snack',     label: 'Snack',     emoji: '🍵', time: '4 – 5 PM' },
  { slot: 'dinner',    label: 'Dinner',    emoji: '🌙', time: 'Before 9 PM' },
];

const Home = () => {
  const { recipes } = useRecipes();
  const [selectedRecipes, setSelectedRecipes] = useState<Record<MealSlot, Recipe | null>>({
    breakfast: null, lunch: null, snack: null, dinner: null,
  });
  const [expandedSlot, setExpandedSlot] = useState<MealSlot | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<FlavorTag | null>(null);

  const allFilterTags: { tag: FlavorTag; emoji: string; color: string }[] = [
    { tag: 'Spicy',       emoji: '🌶️', color: 'bg-red-100 text-red-600 border-red-200' },
    { tag: 'Light',       emoji: '🌿', color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { tag: 'Balanced',    emoji: '⚖️', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { tag: 'Sweet',       emoji: '🍯', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { tag: 'Iron Rich',   emoji: '💪', color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { tag: 'Vitamin Rich',emoji: '✨', color: 'bg-violet-100 text-violet-600 border-violet-200' },
  ];

  const available = groceryItems.filter((i) => i.status === 'available').length;
  const low = groceryItems.filter((i) => i.status === 'low').length;
  const missing = groceryItems.filter((i) => i.status === 'missing').length;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const getRecipesForSlot = (slot: MealSlot): Recipe[] => {
    return recipes.filter((r) => r.mealSlot === slot && (activeTag === null || r.tags.includes(activeTag)));
  };

  const selectRecipe = (slot: MealSlot, recipe: Recipe) => {
    setSelectedRecipes((prev) => ({ ...prev, [slot]: recipe }));
    setExpandedSlot(null);
  };

  const toggleRecipeDetails = (recipeId: string) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  const renderRecipeCard = (recipe: Recipe, slot: MealSlot, isOption: boolean = false) => {
    const availability = checkRecipeAvailability(recipe);
    const isExpanded = expandedRecipe === recipe.id;
    const isSelected = selectedRecipes[slot]?.id === recipe.id;

    return (
      <div
        key={recipe.id}
        className={cn(
          "rounded-2xl border transition-all duration-200",
          isSelected
            ? "bg-emerald-50 border-emerald-300 shadow-sm"
            : "bg-white/60 border-white/40 hover:border-emerald-200",
          isOption ? "cursor-pointer" : ""
        )}
      >
        {/* Header */}
        <div
          className={cn("p-3.5 flex items-center justify-between", isOption && "cursor-pointer")}
          onClick={() => isOption ? selectRecipe(slot, recipe) : toggleRecipeDetails(recipe.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isSelected && <Check size={16} className="text-emerald-600 shrink-0" />}
              <h4 className="text-sm font-semibold text-gray-800 truncate">{recipe.name}</h4>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Clock size={12} /> {recipe.prepTimeMinutes} min
              </span>
              <div className="flex gap-1 flex-wrap">
                {recipe.tags.map((tag) => (
                  <span key={tag} className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    tag === 'Spicy' && "bg-red-100 text-red-600",
                    tag === 'Sweet' && "bg-amber-100 text-amber-600",
                    tag === 'Light' && "bg-sky-100 text-sky-600",
                    tag === 'Balanced' && "bg-emerald-100 text-emerald-600",
                    tag === 'Iron Rich' && "bg-rose-100 text-rose-600",
                    tag === 'Vitamin Rich' && "bg-violet-100 text-violet-600",
                  )}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          {!isOption && (
            <button onClick={(e) => { e.stopPropagation(); toggleRecipeDetails(recipe.id); }}>
              {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && !isOption && (
          <div className="px-3.5 pb-3.5 space-y-3 border-t border-gray-100 pt-3">
            {/* Ingredients with availability */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShoppingCart size={12} /> Ingredients
                <span className="ml-auto text-[10px] font-normal normal-case text-gray-400">
                  {availability.availableCount}✅ {availability.lowCount}🟡 {availability.missingCount}❌
                </span>
              </h5>
              <div className="grid grid-cols-2 gap-1.5">
                {availability.items.map((item) => (
                  <div key={item.name} className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg",
                    item.status === 'available' && "bg-emerald-50 text-emerald-700",
                    item.status === 'low' && "bg-amber-50 text-amber-700",
                    item.status === 'missing' && "bg-red-50 text-red-600",
                  )}>
                    <span className="shrink-0">
                      {item.status === 'available' ? '✅' : item.status === 'low' ? '🟡' : '❌'}
                    </span>
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-[10px] opacity-70 shrink-0">{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📝 Preparation</h5>
              <ol className="space-y-1.5">
                {recipes.find(r => r.id === recipe.id)?.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hi Harenee 👋</h1>
        <p className="text-sm text-foreground/50">Plan for {tomorrowStr}</p>
      </div>

      {/* Diet Filter Chips */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-foreground/40" />
          <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Filter by Diet</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
              activeTag === null
                ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                : "bg-white/70 text-gray-500 border-gray-200 hover:border-gray-400"
            )}
          >
            All
          </button>
          {allFilterTags.map(({ tag, emoji, color }) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
                activeTag === tag
                  ? cn(color, 'shadow-sm ring-1 ring-offset-1 ring-current')
                  : "bg-white/70 text-gray-500 border-gray-200 hover:border-gray-400"
              )}
            >
              {emoji} {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Slots */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Tomorrow's Meal Plan</h2>

        {mealSlotConfig.map(({ slot, label, emoji, time }) => {
          const selected = selectedRecipes[slot];
          const isOpen = expandedSlot === slot;
          const slotRecipes = getRecipesForSlot(slot);

          return (
            <div key={slot} className="space-y-2">
              {/* Slot Header */}
              <button
                onClick={() => setExpandedSlot(isOpen ? null : slot)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{emoji}</span>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-800">{label}</h3>
                    <p className="text-[11px] text-gray-400">{time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected ? (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{selected.name}</span>
                  ) : (
                    <span className="text-[11px] text-gray-400">Tap to choose</span>
                  )}
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Options Dropdown */}
              {isOpen && (
                <div className="space-y-2 pl-2 animate-fade-in">
                  {slotRecipes.length === 0 ? (
                    <p className="text-sm text-gray-400 italic px-2">No recipes match this filter for {label}.</p>
                  ) : (
                    slotRecipes.map((recipe) => renderRecipeCard(recipe, slot, true))
                  )}
                </div>
              )}

              {/* Selected recipe card with full details */}
              {selected && !isOpen && renderRecipeCard(selected, slot, false)}
            </div>
          );
        })}
      </div>

      {/* Grocery Status */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Pantry Status</h2>
        <GlassCard className="flex justify-around py-5">
          <StatusBadge status="available" showLabel count={available} />
          <StatusBadge status="low" showLabel count={low} />
          <StatusBadge status="missing" showLabel count={missing} />
        </GlassCard>
      </div>
    </div>
  );
};

export default Home;
