import MealCard from '@/components/MealCard';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { todaysMeals, groceryItems } from '@/data/mockData';

const Home = () => {
  const available = groceryItems.filter((i) => i.status === 'available').length;
  const low = groceryItems.filter((i) => i.status === 'low').length;
  const missing = groceryItems.filter((i) => i.status === 'missing').length;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hi Harenee 👋</h1>
        <p className="text-sm text-foreground/50">{today}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Today's Meal Plan</h2>
        <div className="grid grid-cols-2 gap-3">
          <MealCard
            name={todaysMeals.breakfast.name}
            tags={todaysMeals.breakfast.tags}
            ingredients={todaysMeals.breakfast.ingredients}
            mealType="Breakfast"
          />
          <MealCard
            name={todaysMeals.lunch.name}
            tags={todaysMeals.lunch.tags}
            ingredients={todaysMeals.lunch.ingredients}
            mealType="Lunch"
          />
          <MealCard
            name={todaysMeals.snack.name}
            tags={todaysMeals.snack.tags}
            ingredients={todaysMeals.snack.ingredients}
            mealType="Snack"
          />
          <MealCard
            name={todaysMeals.dinner.name}
            tags={todaysMeals.dinner.tags}
            ingredients={todaysMeals.dinner.ingredients}
            mealType="Dinner"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Grocery Status</h2>
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
