import { Home, UtensilsCrossed, ShoppingCart, Upload, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'meals' | 'grocery' | 'upload' | 'history';

interface BottomNavProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'history', label: 'History', icon: Clock },
];

const BottomNav = ({ active, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors',
              active === id ? 'text-emerald-600' : 'text-foreground/40'
            )}
          >
            <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
