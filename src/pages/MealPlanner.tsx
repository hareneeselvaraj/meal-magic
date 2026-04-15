import { useState, useEffect } from 'react';
import { type FlavorTag, type Recipe } from '@/data/mockData';
import { useRecipes } from '@/context/RecipeContext';
import { cn } from '@/lib/utils';
import { Clock, ChevronDown, ChevronUp, ShoppingCart, Pencil, Trash2 } from 'lucide-react';
import { checkRecipeAvailability } from '@/lib/groceryChecker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RecipeBuilder from './RecipeBuilder';

const tagColors: Record<string, string> = {
  Spicy: 'bg-red-100 text-red-500',
  Sweet: 'bg-amber-100 text-amber-500',
  Light: 'bg-sky-100 text-sky-500',
  Balanced: 'bg-emerald-100 text-emerald-500',
  'Iron Rich': 'bg-rose-100 text-rose-500',
  'Vitamin Rich': 'bg-violet-100 text-violet-500',
};

const allFilters: FlavorTag[] = ['Spicy', 'Sweet', 'Light', 'Balanced', 'Iron Rich', 'Vitamin Rich'];

interface MealPlannerProps {
  triggerLogMeal?: number;
}

const MealPlanner = ({ triggerLogMeal }: MealPlannerProps) => {
  const { recipes, deleteRecipe } = useRecipes();

  const [activeFilter, setActiveFilter] = useState<FlavorTag | null>(null);
  const [showLogMeal, setShowLogMeal] = useState(false);
  const [expandedLogItem, setExpandedLogItem] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<FlavorTag | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);

  const filtered = activeFilter
    ? recipes.filter((r) => r.tags.includes(activeFilter))
    : recipes;

  const logFilteredRecipes = logFilter
    ? recipes.filter((r) => r.tags.includes(logFilter))
    : recipes;

  useEffect(() => { if (triggerLogMeal) setShowLogMeal(true); }, [triggerLogMeal]);

  if (editingRecipe) {
    return <RecipeBuilder recipe={editingRecipe} onClose={() => setEditingRecipe(null)} />;
  }

  return (
    <div className="space-y-5 relative min-h-[calc(100vh-140px)]">
      <h1 className="text-2xl font-bold text-foreground">All Recipes</h1>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter(null)}
          className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors border', !activeFilter ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/50 border-white/30 text-foreground/60 hover:bg-white/70')}
        >
          All
        </button>
        {allFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors border', activeFilter === f ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/50 border-white/30 text-foreground/60 hover:bg-white/70')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 gap-3 pb-24">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm">No recipes match this filter.</p>
          </div>
        )}
        {filtered.map((recipe) => (
          <div key={recipe.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-800 truncate">{recipe.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock size={12} /> {recipe.prepTimeMinutes} min</span>
                  <span className="text-[11px] text-gray-400 capitalize">· {recipe.mealSlot}</span>
                  <div className="flex gap-1 flex-wrap">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', tagColors[tag] ?? 'bg-gray-100 text-gray-500')}>{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{recipe.ingredients.length} ingredients</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingRecipe(recipe)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteRecipeId(recipe.id)}
                  className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Recipe Confirm */}
      <Dialog open={!!deleteRecipeId} onOpenChange={() => setDeleteRecipeId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Recipe?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteRecipeId(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={() => { deleteRecipeId && deleteRecipe(deleteRecipeId); setDeleteRecipeId(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Meal Dialog */}
      <Dialog open={showLogMeal} onOpenChange={setShowLogMeal}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="text-lg">Log a Meal</DialogTitle>
            <DialogDescription>Select what you cooked — ingredients auto-deduct from pantry.</DialogDescription>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <button onClick={() => setLogFilter(null)} className={cn('px-3 py-1 rounded-full text-[11px] font-semibold border transition-all', !logFilter ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-50 text-gray-400 border-gray-200')}>All</button>
              {allFilters.map((f) => (
                <button key={f} onClick={() => setLogFilter(logFilter === f ? null : f)} className={cn('px-3 py-1 rounded-full text-[11px] font-semibold border transition-all', logFilter === f ? (tagColors[f] ?? 'bg-gray-100') + ' border-current' : 'bg-gray-50 text-gray-400 border-gray-200')}>{f}</button>
              ))}
            </div>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-3 space-y-2 flex-1">
            {logFilteredRecipes.map((recipe) => {
              const isExpanded = expandedLogItem === recipe.id;
              const availability = isExpanded ? checkRecipeAvailability(recipe) : null;
              return (
                <div key={recipe.id} className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden transition-all">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-base font-bold shrink-0">{recipe.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0" onClick={() => setExpandedLogItem(isExpanded ? null : recipe.id)}>
                      <p className="text-sm font-semibold text-gray-800 truncate">{recipe.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={10} /> {recipe.prepTimeMinutes}m</span>
                        <div className="flex gap-1 ml-1">
                          {recipe.tags.map((t) => (<span key={t} className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', tagColors[t] ?? 'bg-gray-100 text-gray-500')}>{t}</span>))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setExpandedLogItem(isExpanded ? null : recipe.id)} className="text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => { setShowLogMeal(false); setExpandedLogItem(null); }} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] rounded-lg font-semibold transition-all">Log</button>
                    </div>
                  </div>
                  {isExpanded && availability && (
                    <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <ShoppingCart size={10} />
                        <span>{availability.availableCount}✅ {availability.lowCount}🟡 {availability.missingCount}❌</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {availability.items.map((item) => (
                          <div key={item.name} className={cn('flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg', item.status === 'available' && 'bg-emerald-50 text-emerald-700', item.status === 'low' && 'bg-amber-50 text-amber-700', item.status === 'missing' && 'bg-red-50 text-red-600')}>
                            <span className="shrink-0 text-[10px]">{item.status === 'available' ? '✅' : item.status === 'low' ? '🟡' : '❌'}</span>
                            <span className="truncate">{item.name}</span>
                            <span className="ml-auto text-[9px] opacity-60 shrink-0">{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanner;
