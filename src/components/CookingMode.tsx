import { useState, useEffect, useRef, useMemo } from 'react';
import type { Recipe } from '@/lib/types';
import { scaleIngredients } from '@/lib/recipeScaler';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Check, ShoppingCart, Info, ChefHat, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CookingModeProps {
  recipe: Recipe;
  servings: number;
  onClose: () => void;
  onMarkComplete?: () => void;
}

export default function CookingMode({ recipe, servings, onClose, onMarkComplete }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wakeLock, setWakeLock] = useState<any>(null); // WakeLockSentinel exists on navigator.wakeLock

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = recipe.instructions;

  // ── Wake Lock Management
  useEffect(() => {
    let lock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          lock = await (navigator as any).wakeLock.request('screen');
          setWakeLock(lock);
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (lock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (lock !== null) lock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ── Step Navigation & Timer Setup
  useEffect(() => {
    // Reset timer when step changes
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    
    const stepDuration = steps[currentStep]?.durationMinutes;
    if (stepDuration) {
      setTimeLeft(stepDuration * 60);
    } else {
      setTimeLeft(0);
    }
  }, [currentStep, steps]);

  // ── Timer Tick
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Play sound?
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play();
            } catch(e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  
  const resetTimer = () => {
    setIsTimerRunning(false);
    const stepDuration = steps[currentStep]?.durationMinutes;
    setTimeLeft(stepDuration ? stepDuration * 60 : 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const prevStep = () => setCurrentStep(p => Math.max(0, p - 1));
  const nextStep = () => setCurrentStep(p => Math.min(steps.length - 1, p + 1));

  const scaledIngredients = useMemo(() => scaleIngredients(recipe.ingredients, recipe.servings, servings), [recipe, servings]);

  const isDone = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col pt-safe animate-in fade-in zoom-in-95 duration-300">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ChefHat size={14} className="text-emerald-500" /> 
            Cooking Mode
          </h2>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 truncate max-w-[280px]">
            {recipe.name}
          </h1>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-gray-500 dark:text-slate-400 shrink-0">
          <X size={20} />
        </button>
      </div>

      {/* ── Progress Bar ── */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col pb-24">
        {/* ── Ingredients Toggle (Mobile friendly Drawer) ── */}
        <div className="px-4 mt-6">
           <button 
             onClick={() => setShowIngredients(!showIngredients)}
             className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 font-bold active:scale-[0.98] transition-all"
           >
             <div className="flex items-center gap-2">
               <ShoppingCart size={18} />
               Ingredients ({scaledIngredients.length})
             </div>
             <div className="text-xs bg-emerald-200/50 dark:bg-emerald-800/50 px-2 py-1 rounded-full">
               For {servings} servings
             </div>
           </button>
           
           {showIngredients && (
             <div className="mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2">
               <ul className="space-y-2">
                 {scaledIngredients.map((ing, i) => (
                   <li key={i} className="flex justify-between items-center text-sm">
                     <span className="text-gray-700 dark:text-slate-300 font-medium">{ing.name}</span>
                     <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">{ing.quantity} {ing.unit}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>

        {/* ── Current Step ── */}
        <div className="flex-1 flex flex-col pt-8 px-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-black text-xl border-4 border-emerald-50 dark:border-emerald-950">
              {currentStep + 1}
            </span>
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              of {steps.length}
            </span>
          </div>
          
          <p className="text-3xl lg:text-4xl leading-tight font-medium text-gray-800 dark:text-slate-100 mb-8 flex-1">
            {steps[currentStep]?.text}
          </p>

          {/* ── Timer UI ── */}
          {steps[currentStep]?.durationMinutes ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-800 flex flex-col items-center gap-4 mt-auto">
              <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center flex items-center justify-center w-full gap-2 relative">
                <span className="absolute left-0">
                  <Bell size={16} className={cn("transition-colors", timeLeft === 0 ? "text-rose-500 animate-bounce" : "text-gray-300")} />
                </span>
                Step Timer
              </div>
              <div className={cn(
                "text-6xl font-black tabular-nums tracking-tighter transition-colors",
                timeLeft === 0 ? "text-rose-500 animate-pulse" : isTimerRunning ? "text-emerald-600 dark:text-emerald-400" : "text-gray-800 dark:text-slate-100"
              )}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center justify-center gap-3 w-full">
                <button 
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <RotateCcw size={22} />
                </button>
                <button 
                  onClick={toggleTimer}
                  className={cn(
                    "flex-1 max-w-[200px] h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg active:scale-95 transition-all shadow-lg",
                    isTimerRunning 
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-xl dark:bg-amber-900/50 dark:text-amber-400" 
                      : timeLeft === 0 
                        ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed dark:bg-slate-800"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/30"
                  )}
                  disabled={timeLeft === 0}
                >
                  {isTimerRunning ? <><Pause strokeWidth={3} /> Pause</> : <><Play strokeWidth={3} className="ml-1" /> Start</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-auto opacity-0" /> // spacer
          )}
        </div>
      </div>

      {/* ── Bottom Navigation Controls ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 p-4 pb-safe-4 flex gap-3 z-10 w-full max-w-2xl mx-auto">
         <button 
           onClick={prevStep} 
           disabled={currentStep === 0}
           className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shrink-0"
         >
           <ChevronLeft size={28} />
         </button>
         
         {!isDone ? (
           <button 
             onClick={nextStep}
             className="flex-1 h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
           >
             Next Step <ChevronRight size={24} className="mt-0.5" />
           </button>
         ) : (
           <button 
             onClick={() => {
                onMarkComplete?.();
                onClose();
             }}
             className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-teal-500/30"
           >
             <Check size={28} strokeWidth={3} /> Finish Cooking
           </button>
         )}
      </div>
    </div>
  );
}
