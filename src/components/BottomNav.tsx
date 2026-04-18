import { useState } from 'react';
import { Home, ChefHat, CalendarDays, ShoppingBasket, Plus, Receipt, Camera, FilePlus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'recipes' | 'planner' | 'grocery';
export type ActionId = 'recipe' | 'grocery' | 'bill' | 'camera';

interface BottomNavProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
  onActionSelect?: (action: ActionId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home',     label: 'Home',     icon: Home },
  { id: 'recipes',  label: 'Recipes',  icon: ChefHat },
  { id: 'planner',  label: 'Plan',     icon: CalendarDays },
  { id: 'grocery',  label: 'Grocery',  icon: ShoppingBasket },
];

const subActions: { id: ActionId; label: string; icon: React.ElementType }[] = [
  { id: 'recipe', label: 'Add Recipe', icon: FilePlus },
  { id: 'grocery', label: 'Add Grocery', icon: ShoppingCart },
  { id: 'bill', label: 'Scan Bill', icon: Receipt },
  { id: 'camera', label: 'Camera', icon: Camera },
];

const BottomNav = ({ active, onTabChange, onActionSelect }: BottomNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleActionClick = (actionId: ActionId) => {
    setIsMenuOpen(false);
    onActionSelect?.(actionId);
  };

  return (
    <>
      {/* Background Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[98] bg-zinc-900/60 dark:bg-black/70 backdrop-blur-[8px] transition-all animate-[fade-in_0.3s_ease-out] touch-none" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[99]">
        <div className="max-w-md mx-auto px-4 pb-4 pt-0 text-center">
          
          {/* Central Radial Menu */}
          <div className="absolute left-1/2 bottom-[76px] -translate-x-1/2 z-[100] w-px h-px hover:pointer-events-auto">
            <div className={cn("relative transition-all duration-300", isMenuOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none")}>
              {subActions.map((action, index) => {
                const angle = 210 + index * 40; // 210, 250, 290, 330
                const rad = (angle * Math.PI) / 180;
                const r = 145; // Increased radial distance to prevent overlap
                const x = Math.round(r * Math.cos(rad));
                const y = Math.round(r * Math.sin(rad));

                return (
                  <div 
                    key={action.id}
                    className="absolute transition-transform duration-300 ease-out"
                    style={{ 
                      transform: `translate(calc(-50% + ${isMenuOpen ? x : 0}px), calc(-50% + ${isMenuOpen ? y : 0}px))`, 
                      transitionDelay: `${index * 40}ms` 
                    }}
                  >
                    <button 
                      onClick={() => handleActionClick(action.id)}
                      className="w-14 h-14 rounded-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.8)] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none md:cursor-pointer relative z-10"
                    >
                      <action.icon size={24} strokeWidth={2.5} />
                    </button>
                    <div className="absolute top-[58px] left-1/2 -translate-x-1/2 w-max pointer-events-none">
                      <span className="text-[11px] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                        {action.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <nav className="relative bg-white dark:bg-slate-950 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shadow-black/10 rounded-full border border-emerald-100/60 dark:border-slate-800">
            <div className="flex items-center justify-between px-2 py-2 h-[72px]">
              {/* Left Tabs */}
              <div className="flex w-2/5 justify-evenly">
                {tabs.slice(0, 2).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setIsMenuOpen(false); onTabChange(id); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200 touch-manipulation',
                      active === id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                    )}
                  >
                    <Icon size={22} strokeWidth={active === id ? 2.5 : 2} />
                    <span className={cn("text-[10px] font-semibold leading-tight", active === id && "text-emerald-600 dark:text-emerald-400")}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Central Action Button Spacer */}
              <div className="w-1/5 relative flex justify-center h-full">
                 <button
                   onClick={() => setIsMenuOpen(!isMenuOpen)}
                   className={cn(
                     "absolute -top-6 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all outline-none md:cursor-pointer z-[100]",
                     isMenuOpen 
                       ? "bg-rose-500 shadow-rose-500/40 rotate-45" 
                       : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40"
                   )}
                   aria-label="Scan / Add"
                 >
                   <Plus size={32} strokeWidth={2.5} />
                 </button>
              </div>

              {/* Right Tabs */}
              <div className="flex w-2/5 justify-evenly">
                {tabs.slice(2, 4).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setIsMenuOpen(false); onTabChange(id); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200 touch-manipulation',
                      active === id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                    )}
                  >
                    <Icon size={22} strokeWidth={active === id ? 2.5 : 2} />
                    <span className={cn("text-[10px] font-semibold leading-tight", active === id && "text-emerald-600 dark:text-emerald-400")}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
