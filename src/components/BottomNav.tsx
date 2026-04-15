import { useState } from 'react';
import { Home, UtensilsCrossed, ShoppingBasket, BarChart3, Plus, X, BookOpen, Camera, ShoppingCart, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'meals' | 'grocery' | 'history';

interface BottomNavProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
  onAction?: (action: string) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'meals',   label: 'Meals',   icon: UtensilsCrossed },
  { id: 'grocery', label: 'Grocery', icon: ShoppingBasket },
  { id: 'history', label: 'History', icon: BarChart3 },
];

const menuActions = [
  { label: "Recipe",  icon: BookOpen,     x: -100, y: -60  },
  { label: "Scan",    icon: Camera,        x: -40,  y: -110 },
  { label: "Grocery", icon: ShoppingCart,  x: 40,   y: -110 },
  { label: "Log",     icon: Flame,         x: 100,  y: -60  },
];

const BottomNav = ({ active, onTabChange, onAction }: BottomNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Radial Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Menu Items — positioned from the center FAB */}
          <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2">
            {menuActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.label}
                  className="absolute flex flex-col items-center gap-1"
                  style={{
                    left: `${action.x}px`,
                    top: `${action.y}px`,
                    transform: 'translate(-50%, -50%)',
                    animation: `radialPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s both`,
                  }}
                >
                  <button
                    className="w-[52px] h-[52px] bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(action.label);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon size={22} />
                  </button>
                  <span className="text-[10px] font-semibold text-white whitespace-nowrap drop-shadow-sm">{action.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[99]">
        <div className="max-w-md mx-auto px-3 pb-3 pt-0">
          <nav className="relative bg-white shadow-2xl shadow-black/10 rounded-[24px] border border-gray-100/80">
            <div className="flex items-center justify-around px-2 py-2">
              {/* Left 2 tabs */}
              {tabs.slice(0, 2).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors duration-200 touch-manipulation',
                    active === id ? 'text-emerald-600' : 'text-gray-400'
                  )}
                >
                  <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
                  <span className="text-[9px] font-semibold leading-tight">{label}</span>
                </button>
              ))}

              {/* Center FAB zone — generous touch target */}
              <div className="relative w-16 flex items-center justify-center">
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 z-[100]"
                  style={{ touchAction: 'manipulation' }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 touch-manipulation",
                      isMenuOpen
                        ? "bg-rose-500 shadow-rose-500/30 scale-95"
                        : "bg-emerald-500 shadow-emerald-500/30 active:scale-90"
                    )}
                    aria-label="Quick Actions"
                  >
                    {isMenuOpen
                      ? <X size={24} strokeWidth={2.5} />
                      : <Plus size={24} strokeWidth={2.5} />
                    }
                  </button>
                </div>
                {/* Invisible tap zone filling the gap in the nav bar */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-full h-full min-h-[44px] touch-manipulation"
                  aria-hidden="true"
                />
              </div>

              {/* Right 2 tabs */}
              {tabs.slice(2, 4).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors duration-200 touch-manipulation',
                    active === id ? 'text-emerald-600' : 'text-gray-400'
                  )}
                >
                  <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
                  <span className="text-[9px] font-semibold leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Keyframes for radial pop animation */}
      <style>{`
        @keyframes radialPop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
};

export default BottomNav;
