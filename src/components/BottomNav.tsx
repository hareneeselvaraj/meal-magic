import { Home, ChefHat, CalendarDays, ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'recipes' | 'planner' | 'grocery';

interface BottomNavProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home',     label: 'Home',     icon: Home },
  { id: 'recipes',  label: 'Recipes',  icon: ChefHat },
  { id: 'planner',  label: 'Plan',     icon: CalendarDays },
  { id: 'grocery',  label: 'Grocery',  icon: ShoppingBasket },
];

const BottomNav = ({ active, onTabChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99]">
      <div className="max-w-md mx-auto px-3 pb-3 pt-0">
        <nav className="relative bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-[24px] border border-emerald-100/60 dark:border-slate-800">
          <div className="flex items-center justify-around px-2 py-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 touch-manipulation',
                  active === id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                )}
              >
                <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
                <span className={cn("text-[9px] font-semibold leading-tight", active === id && "text-emerald-600 dark:text-emerald-400")}>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
