import { useState } from 'react';
import { useNutriMom } from '@/context/NutriMomContext';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import type { MealSlot, FlavorTag, HealthTag, RecipeIngredient, RecipeInstruction, NutritionInfo, VideoLink, Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, Check, ChevronRight, ChevronLeft, Video, ExternalLink, X } from 'lucide-react';

interface RecipeFormProps {
  onClose: () => void;
  videoData?: { url: string; language: string; platform: string; extractedRecipe?: any };
}

const STEPS = ['Basics', 'Ingredients', 'Steps', 'Tags', 'Videos'];

const FLAVOR_TAGS: FlavorTag[] = ['Spicy', 'Sweet', 'Light', 'Balanced', 'Iron Rich', 'Vitamin Rich'];
const HEALTH_TAGS: { id: HealthTag; label: string }[] = [
  { id: 'pregnancy_safe', label: 'Pregnancy Safe' },
  { id: 'heart_friendly', label: 'Heart Friendly' },
  { id: 'iron_boost', label: 'Iron Boost' },
  { id: 'calcium_rich', label: 'Calcium Rich' },
  { id: 'low_sodium', label: 'Low Sodium' },
  { id: 'high_fiber', label: 'High Fiber' },
  { id: 'folate_rich', label: 'Folate Rich' },
];

const RecipeForm = ({ onClose, videoData }: RecipeFormProps) => {
  const { cuisines, addRecipe } = useNutriMom();
  const activeCuisines = cuisines.filter(c => c.isActive);
  const [step, setStep] = useState(0);

  // Pre-fill from extracted recipe data
  const extracted = videoData?.extractedRecipe;

  // Form state — pre-fill from extraction if available
  const [name, setName] = useState(extracted?.title || '');
  const [nameTamil, setNameTamil] = useState(extracted?.titleTamil || '');
  const [cuisineId, setCuisineId] = useState(activeCuisines[0]?.id || '');
  const [mealSlot, setMealSlot] = useState<MealSlot>('breakfast');
  const [prepTime, setPrepTime] = useState(10);
  const [cookTime, setCookTime] = useState(15);
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    extracted?.ingredients?.length > 0
      ? extracted.ingredients.map((ing: any) => ({
          name: ing.name || '',
          nameInTamil: '',
          quantity: ing.quantity || '',
          unit: ing.unit || '',
          isOptional: false,
        }))
      : [{ name: '', nameInTamil: '', quantity: '', unit: '', isOptional: false }]
  );
  const [instructions, setInstructions] = useState<RecipeInstruction[]>(
    extracted?.steps?.length > 0
      ? extracted.steps.map((s: any) => ({
          stepNumber: s.stepNumber,
          text: s.text || '',
          textInTamil: '',
          durationMinutes: null,
        }))
      : [{ stepNumber: 1, text: '', textInTamil: '', durationMinutes: null }]
  );
  const [tags, setTags] = useState<FlavorTag[]>([]);
  const [healthTags, setHealthTags] = useState<HealthTag[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>(
    videoData ? [{
      url: videoData.url,
      platform: videoData.platform as 'youtube' | 'instagram',
      originalLanguage: videoData.language as Language,
      transcriptEnglish: '',
      transcriptTamil: '',
      addedAt: new Date(),
    }] : []
  );
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLang, setVideoLang] = useState<Language>('en');

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', nameInTamil: '', quantity: '', unit: '', isOptional: false }]);
  };
  const removeIngredient = (i: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateIngredient = (i: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));
  };

  const addInstruction = () => {
    setInstructions(prev => [...prev, { stepNumber: prev.length + 1, text: '', textInTamil: '', durationMinutes: null }]);
  };
  const removeInstruction = (i: number) => {
    setInstructions(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };
  const updateInstruction = (i: number, field: string, value: any) => {
    setInstructions(prev => prev.map((inst, idx) => idx === i ? { ...inst, [field]: value } : inst));
  };

  const toggleTag = (tag: FlavorTag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const toggleHealthTag = (tag: HealthTag) => {
    setHealthTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const detectPlatform = (url: string): 'youtube' | 'instagram' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'instagram';
  };

  const addVideoLink = () => {
    if (!videoUrl.trim()) return;
    setVideoLinks(prev => [...prev, {
      url: videoUrl.trim(),
      platform: detectPlatform(videoUrl),
      originalLanguage: videoLang,
      transcriptEnglish: '',
      transcriptTamil: '',
      addedAt: new Date(),
    }]);
    setVideoUrl('');
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const cuisine = activeCuisines.find(c => c.id === cuisineId);
    addRecipe({
      name, nameInTamil: nameTamil, cuisineId, cuisineName: cuisine?.name || '',
      mealSlot, tags, healthTags,
      prepTimeMinutes: prepTime, cookTimeMinutes: cookTime, servings,
      ingredients: ingredients.filter(ing => ing.name.trim()),
      instructions: instructions.filter(inst => inst.text.trim()),
      nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, sodium: 0 },
      videoLinks, imageUrl: null, createdBy: 'user', isPublic: true,
    });
    onClose();
  };

  const canProceed = () => {
    if (step === 0) return name.trim() && cuisineId;
    if (step === 1) return ingredients.some(i => i.name.trim());
    if (step === 2) return instructions.some(i => i.text.trim());
    return true;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700 flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-foreground">New Recipe</h1>
      </div>

      {/* Video source banner */}
      {videoData && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200/50 dark:border-red-900/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
            <Video size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">Extracted from Video</p>
            <p className="text-[10px] text-red-400 dark:text-red-500 truncate">{extracted?.channelName || videoData.url}</p>
            {extracted && (
              <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 font-medium">
                {extracted.ingredients?.length || 0} ingredients • {extracted.steps?.length || 0} steps found
              </p>
            )}
          </div>
          <a href={videoData.url} target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-600">
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i <= step ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
            )}>{i + 1}</div>
            <span className={cn("text-[10px] font-medium hidden xs:block", i <= step ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500")}>{s}</span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 rounded", i < step ? "bg-emerald-400" : "bg-gray-200 dark:bg-slate-700")} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4 animate-fade-in">
        {step === 0 && (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 block">Recipe Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Spinach Iron Smoothie"
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 block">Name in Tamil</label>
              <input type="text" value={nameTamil} onChange={e => setNameTamil(e.target.value)}
                placeholder="தமிழ் பெயர்"
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 block">Cuisine *</label>
              <div className="flex flex-wrap gap-2">
                {activeCuisines.map(c => (
                  <button key={c.id} onClick={() => setCuisineId(c.id)}
                    className={cn("px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                      cuisineId === c.id ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" : "border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-gray-600 dark:text-slate-400"
                    )}>{c.emoji} {c.name}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 block">Meal Slot *</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_SLOT_CONFIG.map(s => (
                  <button key={s.key} onClick={() => setMealSlot(s.key)}
                    className={cn("px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                      mealSlot === s.key ? "border-teal-400 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400" : "border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-gray-600 dark:text-slate-400"
                    )}>{s.emoji} {s.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase mb-1 block">Prep (min)</label>
                <input type="number" value={prepTime} onChange={e => setPrepTime(+e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-center text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase mb-1 block">Cook (min)</label>
                <input type="number" value={cookTime} onChange={e => setCookTime(+e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-center text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase mb-1 block">Servings</label>
                <input type="number" value={servings} onChange={e => setServings(+e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm text-center text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">Ingredients</h3>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input type="text" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Name" className="col-span-2 px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
                  <div className="flex gap-1">
                    <input type="text" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                      placeholder="Qty" className="w-1/2 px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
                    <input type="text" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                      placeholder="Unit" className="w-1/2 px-2 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
                  </div>
                </div>
                <button onClick={() => removeIngredient(i)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Trash2 size={12} className="text-gray-400 dark:text-slate-500" />
                </button>
              </div>
            ))}
            <button onClick={addIngredient} className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500 font-medium hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-1">
              <Plus size={14} /> Add Ingredient
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">Cooking Steps</h3>
            {instructions.map((inst, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-2 shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <textarea value={inst.text} onChange={e => updateInstruction(i, 'text', e.target.value)}
                    placeholder={`Step ${i + 1}...`} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
                </div>
                <button onClick={() => removeInstruction(i)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                  <Trash2 size={12} className="text-gray-400 dark:text-slate-500" />
                </button>
              </div>
            ))}
            <button onClick={addInstruction} className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500 font-medium hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-1">
              <Plus size={14} /> Add Step
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Flavor Tags</h3>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={cn("text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
                      tags.includes(tag) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white/70 dark:bg-slate-800/70 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
                    )}>{tag}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Health Tags</h3>
              <div className="flex flex-wrap gap-2">
                {HEALTH_TAGS.map(ht => (
                  <button key={ht.id} onClick={() => toggleHealthTag(ht.id)}
                    className={cn("text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
                      healthTags.includes(ht.id) ? "bg-teal-500 text-white border-teal-500" : "bg-white/70 dark:bg-slate-800/70 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
                    )}>{ht.label}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">Video Links</h3>
              <p className="text-xs text-gray-400 mb-3">Add YouTube or Instagram recipe videos (English or Tamil)</p>

              {/* Existing links */}
              {videoLinks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {videoLinks.map((vid, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-gray-200">
                      <span className={cn("text-sm", vid.platform === 'youtube' ? 'text-red-500' : 'text-pink-500')}>
                        {vid.platform === 'youtube' ? '▶' : '◉'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-gray-700 capitalize">{vid.platform}</span>
                        <p className="text-[9px] text-blue-500 truncate">{vid.url}</p>
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                        vid.originalLanguage === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      )}>
                        {vid.originalLanguage === 'en' ? 'EN' : 'TA'}
                      </span>
                      <button onClick={() => removeVideoLink(i)} className="text-gray-300 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new link */}
              <div className="space-y-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube or Instagram URL..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Language:</span>
                  <button onClick={() => setVideoLang('en')}
                    className={cn("text-xs px-3 py-1.5 rounded-full font-semibold border transition-all",
                      videoLang === 'en' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'
                    )}>🇬🇧 English</button>
                  <button onClick={() => setVideoLang('ta')}
                    className={cn("text-xs px-3 py-1.5 rounded-full font-semibold border transition-all",
                      videoLang === 'ta' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'
                    )}>🇮🇳 தமிழ்</button>
                  <button onClick={addVideoLink} disabled={!videoUrl.trim()}
                    className={cn("ml-auto text-xs px-3 py-1.5 rounded-full font-semibold transition-all",
                      videoUrl.trim() ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    )}>+ Add</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-slate-300 flex items-center justify-center gap-1">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              className={cn("flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1",
                canProceed() ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
              )}>Next <ChevronRight size={16} /></button>
          ) : (
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg flex items-center justify-center gap-1">
              <Check size={16} /> Create Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;
