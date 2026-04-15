import { useState } from 'react';
import MealCard from '@/components/MealCard';
import { allMeals, type FlavorTag } from '@/data/mockData';
import { cn } from '@/lib/utils';

const filters: FlavorTag[] = ['Spicy', 'Sweet', 'Light', 'Balanced'];

const MealPlanner = () => {
  const [activeFilter, setActiveFilter] = useState<FlavorTag | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());

  const filtered = activeFilter
    ? allMeals.filter((m) => m.tags.includes(activeFilter))
    : allMeals;

  const toggleMeal = (id: string) => {
    setSelectedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Meal Planner</h1>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              activeFilter === f
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white/50 border-white/30 text-foreground/60 hover:bg-white/70'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((meal) => (
          <MealCard
            key={meal.id}
            name={meal.name}
            tags={meal.tags}
            ingredients={meal.ingredients}
            selected={selectedMeals.has(meal.id)}
            onSelect={() => toggleMeal(meal.id)}
            showSelectButton
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
