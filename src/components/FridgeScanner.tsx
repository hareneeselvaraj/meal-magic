import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Loader2, Sparkles, ChefHat, Info, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scanFridgeForRecipes } from '@/lib/aiFridgeScanner';
import { useMealPlanner } from '@/context/MealPlannerContext';
import type { Recipe } from '@/lib/types';

interface FridgeScannerProps {
  onClose: () => void;
  onRecipeCreated?: (recipe: Recipe) => void;
}

export default function FridgeScanner({ onClose, onRecipeCreated }: FridgeScannerProps) {
  const { activeProfile, addRecipe } = useMealPlanner();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Partial<Recipe>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);

  // ── Camera Management ──
  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (!capturedImage && !generatedRecipes) {
      startCamera();
    }
    return () => stopCamera();
  }, [capturedImage, generatedRecipes]);

  // ── Capture & Process ──
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const jpegBase64 = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(jpegBase64);
    stopCamera();
    
    processImage(jpegBase64);
  };

  const processImage = async (dataUrl: string) => {
    setIsProcessing(true);
    setError(null);
    
    // Strip "data:image/jpeg;base64," prefix
    const base64Data = dataUrl.split(',')[1];
    
    try {
      const recipes = await scanFridgeForRecipes({
        base64Image: base64Data,
        imageMimeType: 'image/jpeg',
        cuisinePreferences: activeProfile.preferredCuisines,
        dietaryRestrictions: activeProfile.deficiencies
      });
      
      setGeneratedRecipes(recipes);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze fridge');
      setCapturedImage(null); // allow retrying
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setGeneratedRecipes(null);
    setError(null);
  };

  const handleSaveRecipe = () => {
    if (!generatedRecipes) return;
    const selected = generatedRecipes[activeRecipeIndex];
    if (!selected) return;

    // Fill in missing default fields
    const newRecipe = addRecipe({
      name: selected.name || 'AI Recipe',
      nameInTamil: selected.name || 'AI Recipe',
      cuisineId: 'c_general', // Or guess from name
      cuisineName: selected.cuisineName || 'General',
      mealSlot: selected.mealSlot || 'lunch',
      tags: [],
      healthTags: [],
      prepTimeMinutes: selected.prepTimeMinutes || 10,
      cookTimeMinutes: selected.cookTimeMinutes || 20,
      servings: selected.servings || 2,
      ingredients: selected.ingredients || [],
      instructions: selected.instructions || [],
      nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, sodium: 0 },
      videoLinks: [],
      imageUrl: capturedImage, // saves fridge photo as recipe cover for now
      createdBy: 'ai',
      isPublic: false
    });

    onRecipeCreated?.(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md sm:p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full h-full max-w-md sm:max-h-[850px] mx-auto flex flex-col overflow-hidden bg-black sm:rounded-[40px] sm:border-[6px] sm:border-gray-900 shadow-2xl shadow-emerald-500/10">
        
        {/* ── Header ── */}
        <div className="absolute top-4 sm:top-6 inset-x-4 flex justify-between z-10">
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white font-bold flex items-center gap-2 border border-white/20">
            <Sparkles size={16} className="text-emerald-400" />
            Cook from Photo
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ── Camera / Preview Area ── */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
          {!capturedImage && (
             <>
               <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
               {/* Reticle / overlay border */}
               <div className="absolute inset-8 border-2 border-white/30 rounded-3xl pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30" />
               </div>
             </>
          )}
          
          {capturedImage && (
             <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 transition-all">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse mb-6 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                 <Loader2 size={36} className="text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">Analyzing Ingredients...</h3>
              <p className="text-emerald-300 text-sm italic">Cooking up some ideas</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-rose-500/90 backdrop-blur-md p-6 rounded-3xl border border-rose-400 z-20 text-center shadow-xl">
               <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center mx-auto mb-4">
                 <X size={24} className="text-white" />
               </div>
               <p className="text-white font-medium">{error}</p>
               <button onClick={handleRetake} className="mt-6 px-6 py-2 rounded-full bg-white text-rose-600 font-bold hover:bg-rose-50 transition-colors">Try Again</button>
            </div>
          )}
        </div>

        {/* ── Control Bar / Results ── */}
        <div className="bg-white dark:bg-slate-950 rounded-t-3xl min-h-[200px] pb-safe-4 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col border-t border-white/10 sm:rounded-b-[34px]">
          {!capturedImage ? (
            // Capture Button UI
            <div className="flex-1 flex items-center justify-center gap-8 py-8 px-6">
              <div className="w-12 h-12" /> {/* spacer */}
              <button 
                 onClick={handleCapture}
                 disabled={!stream}
                 className="w-20 h-20 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all text-emerald-500"
              >
                 <Camera size={32} />
              </button>
              <div className="w-12 h-12" /> {/* spacer */}
            </div>
          ) : generatedRecipes ? (
            // Results UI
            <div className="flex-1 flex flex-col p-5">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                   <ChefHat size={20} className="text-emerald-500" /> Options Found
                 </h3>
                 <button onClick={handleRetake} className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 font-semibold active:scale-95 transition-transform"><RefreshCw size={12} /> Retake</button>
               </div>

               {/* Carousel */}
               <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-5 px-5">
                 {generatedRecipes.map((recipe, idx) => (
                   <div
                     key={idx}
                     onClick={() => setActiveRecipeIndex(idx)}
                     className={cn(
                       "snap-center shrink-0 w-[260px] rounded-2xl border p-4 transition-all duration-300 cursor-pointer overflow-hidden relative",
                       activeRecipeIndex === idx 
                         ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20" 
                         : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 opacity-60 scale-95"
                     )}
                   >
                     <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">{recipe.cuisineName || 'Mix'} Cuisine</div>
                     <h4 className="text-base font-black text-gray-900 dark:text-slate-100 leading-tight mb-2 truncate">{recipe.name}</h4>
                     
                     <div className="flex gap-2 mb-3">
                       <span className="text-[10px] font-semibold bg-white/60 dark:bg-slate-800 px-2 py-0.5 rounded-md text-gray-600 dark:text-slate-300">{recipe.prepTimeMinutes! + recipe.cookTimeMinutes!}m total</span>
                       <span className="text-[10px] font-semibold bg-white/60 dark:bg-slate-800 px-2 py-0.5 rounded-md text-gray-600 dark:text-slate-300">{recipe.ingredients?.length} ingredients</span>
                     </div>
                     
                     {activeRecipeIndex === idx && (
                       <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-in zoom-in">
                         <Check size={14} strokeWidth={3} />
                       </div>
                     )}
                   </div>
                 ))}
               </div>

               {/* Action Button */}
               <button 
                  onClick={handleSaveRecipe}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
               >
                  <Plus size={20} strokeWidth={2.5} /> Save & Cook This
               </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
