import { useState, useMemo } from 'react';
import { useMealPlanner } from '@/context/MealPlannerContext';
import { MEAL_SLOT_CONFIG } from '@/lib/types';
import type { MealSlot, Recipe, VideoLink, Language } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { downloadRecipePDF } from '@/lib/pdfGenerator';
import { extractRecipeFromVideo, type ExtractedRecipe } from '@/lib/videoExtractor';
import { Search, Clock, ChevronDown, ChevronUp, ShoppingCart, ArrowLeft, Heart, Sparkles, X, Plus, Edit2, Trash2, Check, ChefHat, Video, Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export interface VideoImportData {
  url: string;
  language: string;
  platform: string;
  extractedRecipe?: ExtractedRecipe;
}

interface RecipesProps {
  onOpenRecipeForm?: (videoData?: VideoImportData) => void;
  initialCuisineId?: string | null;
  onCuisineChange?: (cuisineId: string | null) => void;
}

const Recipes = ({ onOpenRecipeForm, initialCuisineId, onCuisineChange }: RecipesProps) => {
  const { recipes, cuisines, addCuisine, updateCuisine, deleteCuisine, updateRecipe, activeProfile } = useMealPlanner();

  // Navigation: null = cuisine grid, string = selected cuisine id
  const [selectedCuisine, setSelectedCuisineLocal] = useState<string | null>(initialCuisineId ?? null);

  // Sync with parent when changed
  const setSelectedCuisine = (id: string | null) => {
    setSelectedCuisineLocal(id);
    onCuisineChange?.(id);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  // Cuisine management
  const [showCuisineForm, setShowCuisineForm] = useState(false);
  const [editingCuisineId, setEditingCuisineId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTamil, setFormTamil] = useState('');
  const [formEmoji, setFormEmoji] = useState('🍽️');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Video import modal
  const [showVideoImport, setShowVideoImport] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLang, setVideoLang] = useState<'en' | 'ta' | 'hi'>('en');
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [videoError, setVideoError] = useState('');

  // PDF language popup
  const [pdfRecipe, setPdfRecipe] = useState<Recipe | null>(null);

  const activeCuisines = cuisines.filter(c => 
    c.isActive && (activeProfile.preferredCuisines?.length ? activeProfile.preferredCuisines.includes(c.id) : true)
  );

  const filteredRecipes = useMemo(() => {
    if (!selectedCuisine) return [];
    const meatKeywords = ['chicken', 'mutton', 'beef', 'pork', 'fish', 'prawn', 'egg', 'meat', 'lamb', 'seafood'];
    return recipes.filter(r => {
      if (activeProfile.isVegetarian) {
        const hasMeat = r.ingredients.some(ing => meatKeywords.some(mk => ing.name.toLowerCase().includes(mk)));
        if (hasMeat) return false;
      }
      if (r.cuisineId !== selectedCuisine) return false;
      if (selectedSlot && r.mealSlot !== selectedSlot) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [recipes, selectedCuisine, selectedSlot, searchQuery, activeProfile.isVegetarian]);

  const getRecipeCount = (cuisineId: string) => recipes.filter(r => r.cuisineId === cuisineId).length;

  const tagColors: Record<string, string> = {
    'Spicy': 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    'Sweet': 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    'Light': 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
    'Balanced': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    'Iron Rich': 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    'Vitamin Rich': 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
  };

  // ── Cuisine CRUD ──────────────────────────────────
  const emojiOptions = ['🍽️', '🥘', '🍜', '🥗', '🧆', '🍕', '🥟', '🌮', '🍱', '🥙', '🫕', '🥖'];

  const openAddCuisine = () => {
    setEditingCuisineId(null);
    setFormName(''); setFormTamil(''); setFormEmoji('🍽️');
    setShowCuisineForm(true);
  };
  const openEditCuisine = (c: typeof cuisines[0]) => {
    setEditingCuisineId(c.id);
    setFormName(c.name); setFormTamil(c.nameInTamil); setFormEmoji(c.emoji);
    setShowCuisineForm(true);
  };
  const handleCuisineSubmit = () => {
    if (!formName.trim()) return;
    if (editingCuisineId) {
      updateCuisine(editingCuisineId, { name: formName, nameInTamil: formTamil, emoji: formEmoji });
    } else {
      addCuisine({ name: formName, nameInTamil: formTamil, emoji: formEmoji, isDefault: false, isActive: true, createdBy: 'user' });
    }
    setShowCuisineForm(false);
  };

  // ── Video Import ──────────────────────────────────
  const detectPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'instagram';
  };

  const handleVideoImport = async () => {
    if (!videoUrl.trim()) return;
    setVideoProcessing(true);
    setVideoError('');

    try {
      const result = await extractRecipeFromVideo(videoUrl.trim(), videoLang);

      if (result.success && result.recipe) {
        setShowVideoImport(false);
        onOpenRecipeForm?.({
          url: videoUrl.trim(),
          language: videoLang,
          platform: detectPlatform(videoUrl),
          extractedRecipe: result.recipe,
        });
        setVideoUrl('');
      } else {
        setVideoError(result.error || 'Could not extract recipe from this video. You can still add details manually.');
        // Still allow opening the form after 2 seconds
        setTimeout(() => {
          setShowVideoImport(false);
          onOpenRecipeForm?.({
            url: videoUrl.trim(),
            language: videoLang,
            platform: detectPlatform(videoUrl),
          });
          setVideoUrl('');
          setVideoError('');
        }, 2500);
      }
    } catch (e) {
      setVideoError('Network error. Opening form for manual entry...');
      setTimeout(() => {
        setShowVideoImport(false);
        onOpenRecipeForm?.({
          url: videoUrl.trim(),
          language: videoLang,
          platform: detectPlatform(videoUrl),
        });
        setVideoUrl('');
        setVideoError('');
      }, 2000);
    } finally {
      setVideoProcessing(false);
    }
  };

  // ── PDF with language popup ───────────────────────
  const handleDownloadPDF = (lang: 'en' | 'ta') => {
    if (!pdfRecipe) return;
    downloadRecipePDF(pdfRecipe, lang);
    setPdfRecipe(null);
  };

  // ── Render recipe card ────────────────────────────
  const renderRecipeCard = (recipe: Recipe) => {
    const isExpanded = expandedRecipe === recipe.id;
    return (
      <div key={recipe.id} className="rounded-2xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/40 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 overflow-hidden">
        <div className="p-3.5 cursor-pointer" onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{recipe.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Clock size={10} /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                </span>
                <span className="text-gray-200">•</span>
                <span className="text-[10px] text-gray-400">{recipe.servings} srv</span>
                {recipe.videoLinks && recipe.videoLinks.length > 0 && (
                  <>
                    <span className="text-gray-200">•</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                      <Video size={10} /> {recipe.videoLinks.length}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {recipe.tags.map(tag => (
                  <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", tagColors[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 mt-0.5 shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); updateRecipe(recipe.id, { isFavourite: !recipe.isFavourite }); }}
                className={cn("p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors", recipe.isFavourite ? "text-rose-500" : "text-gray-300 hover:text-gray-400")}
              >
                <Heart size={16} className={recipe.isFavourite ? "fill-current" : ""} />
              </button>
              <button className="">
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-3.5 pb-3.5 space-y-3 border-t border-gray-100 dark:border-slate-800 flex-1 pt-3 animate-fade-in bg-white/40 dark:bg-slate-950/40">
            {recipe.healthTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {recipe.healthTags.map(ht => (
                  <span key={ht} className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-0.5">
                    <Heart size={8} /> {ht.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            <div>
              <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShoppingCart size={12} /> Ingredients
              </h5>
              <div className="grid grid-cols-2 gap-1.5">
                {recipe.ingredients.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                    <span className="text-emerald-500 shrink-0">•</span>
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-[10px] opacity-60 shrink-0">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">📝 Steps</h5>
              <ol className="space-y-1.5">
                {recipe.instructions.map((step) => (
                  <li key={step.stepNumber} className="flex gap-2 text-xs text-gray-600 dark:text-slate-300">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-0.5">{step.stepNumber}</span>
                    <div className="flex-1">
                      <span>{step.text}</span>
                      {step.durationMinutes && <span className="ml-1 text-[10px] text-gray-400 dark:text-slate-500">({step.durationMinutes}m)</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {recipe.nutritionPer100g.calories > 0 && (
              <div>
                <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">🥗 Nutrition (per 100g)</h5>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: 'Cal', v: recipe.nutritionPer100g.calories, u: '' },
                    { l: 'Protein', v: recipe.nutritionPer100g.protein, u: 'g' },
                    { l: 'Iron', v: recipe.nutritionPer100g.iron, u: 'mg' },
                    { l: 'Fiber', v: recipe.nutritionPer100g.fiber, u: 'g' },
                  ].map(n => (
                    <div key={n.l} className="text-center p-1.5 rounded-lg bg-emerald-50/50 dark:bg-slate-800">
                      <div className="text-xs font-bold text-gray-700 dark:text-slate-300">{n.v}{n.u}</div>
                      <div className="text-[9px] text-gray-400 dark:text-slate-500">{n.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Video Links ── */}
            {recipe.videoLinks && recipe.videoLinks.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Video size={12} /> Source Videos
                </h5>
                <div className="space-y-1.5">
                  {recipe.videoLinks.map((vid, vi) => (
                    <a key={vi} href={vid.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                      <span className={cn("text-sm", vid.platform === 'youtube' ? 'text-red-500' : 'text-pink-500')}>
                        {vid.platform === 'youtube' ? '▶' : '◉'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-gray-700 dark:text-slate-300 capitalize">{vid.platform}</span>
                        <p className="text-[9px] text-blue-500 dark:text-blue-400 truncate">{vid.url}</p>
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                        vid.originalLanguage === 'en' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' :
                        vid.originalLanguage === 'ta' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400'
                      )}>
                        {vid.originalLanguage === 'en' ? 'EN' : vid.originalLanguage === 'ta' ? 'TA' : 'HI'}
                      </span>
                      <ExternalLink size={12} className="text-gray-400 dark:text-slate-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── PDF Download Button ── */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); setPdfRecipe(recipe); }}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-95 transition-all"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════
  //  CUISINE GRID (Landing)
  // ══════════════════════════════════════════════════
  if (!selectedCuisine) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400">
            <Sparkles size={24} className="text-emerald-500" />
            Recipes
          </h1>
          <button
            onClick={openAddCuisine}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(16,185,129,0.6)] active:scale-95 transition-all duration-300"
          >
            <Plus size={16} /> Cuisine
          </button>
        </div>

        {/* Cuisine Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {activeCuisines.map(cuisine => {
            const count = getRecipeCount(cuisine.id);
            const isDeleting = deleteConfirm === cuisine.id;

            return (
              <div
                key={cuisine.id}
                onClick={() => { if (!isDeleting) { setSelectedCuisine(cuisine.id); setSearchQuery(''); setSelectedSlot(null); setExpandedRecipe(null); } }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-5 cursor-pointer bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:bg-white/90 dark:hover:bg-slate-900/90",
                  isDeleting && "ring-2 ring-rose-400"
                )}
              >
                {/* Sweep Background Gradient */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-100/60 dark:from-emerald-900/30 to-teal-50/20 dark:to-teal-900/20 blur-2xl rounded-full transition-transform duration-700 group-hover:scale-150" />
                
                <div className="relative z-10">
                  <div className="w-[52px] h-[52px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-sm border border-white dark:border-slate-700 flex items-center justify-center text-3xl mb-4 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-500">
                    <span className="drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{cuisine.emoji || '🍽️'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{cuisine.name}</h3>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500 mt-0.5">{cuisine.nameInTamil}</p>
                  
                  <div className="flex items-center gap-1.5 mt-3">
                    <ChefHat size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-semibold text-gray-500">{count} recipes</span>
                  </div>

                  {isDeleting ? (
                    <div className="flex items-center gap-2 mt-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { deleteCuisine(cuisine.id); setDeleteConfirm(null); }}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-[11px] font-bold shadow-md active:scale-95 transition-transform">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2 rounded-xl bg-gray-100/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 text-[11px] font-bold hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEditCuisine(cuisine)}
                        className="w-8 h-8 rounded-full bg-gray-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-gray-500 dark:text-slate-400">
                        <Edit2 size={13} />
                      </button>
                      {!cuisine.isDefault && (
                        <button onClick={() => setDeleteConfirm(cuisine.id)}
                          className="w-8 h-8 rounded-full bg-gray-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-gray-500 dark:text-slate-400">
                          <Trash2 size={13} />
                        </button>
                      )}
                      {cuisine.isDefault && (
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-auto">Default</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Premium Add Card */}
          <button
            onClick={openAddCuisine}
            className="group rounded-3xl border-2 border-dashed border-gray-200/80 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 p-5 flex flex-col items-center justify-center gap-3 min-h-[180px] hover:border-emerald-300/80 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Plus size={20} className="text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-500 font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Add Cuisine</span>
          </button>
        </div>

        {/* Cuisine Add/Edit Modal */}
        {showCuisineForm && (
          <div className="fixed inset-0 z-[97] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowCuisineForm(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 animate-fade-in shadow-xl border border-white/10 dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">{editingCuisineId ? 'Edit Cuisine' : 'New Cuisine'}</h3>
                <button onClick={() => setShowCuisineForm(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                  <X size={16} className="text-gray-500 dark:text-slate-400" />
                </button>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(e => (
                    <button key={e} onClick={() => setFormEmoji(e)}
                      className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all",
                        formEmoji === e ? "bg-emerald-100 dark:bg-emerald-900/50 ring-2 ring-emerald-400 scale-110" : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                      )}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Mexican"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Name in Tamil</label>
                <input type="text" value={formTamil} onChange={e => setFormTamil(e.target.value)} placeholder="e.g., மெக்ஸிகன்"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700" />
              </div>
              <button onClick={handleCuisineSubmit} disabled={!formName.trim()}
                className={cn("w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  formName.trim() ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                )}>
                <Check size={16} /> {editingCuisineId ? 'Save Changes' : 'Add Cuisine'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  //  RECIPE LIST (After selecting a cuisine)
  // ══════════════════════════════════════════════════
  const activeCuisine = cuisines.find(c => c.id === selectedCuisine);

  return (
    <div className="space-y-4 pb-8">
      {/* Header with Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSelectedCuisine(null); setSearchQuery(''); setSelectedSlot(null); }}
          className="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">{activeCuisine?.emoji}</span>
            {activeCuisine?.name} Recipes
          </h1>
          <p className="text-xs text-foreground/50">{filteredRecipes.length} recipes</p>
        </div>
        {/* ★ ADD RECIPE BUTTONS ★ */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpenRecipeForm?.()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-95 transition-all"
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={() => { setShowVideoImport(true); setVideoUrl(''); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold shadow-lg shadow-red-500/20 hover:shadow-xl active:scale-95 transition-all"
          >
            <Video size={14} /> Add from Video
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
        <input
          type="text" placeholder="Search recipes..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-white/40 dark:border-slate-800 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 focus:border-emerald-300 dark:focus:border-emerald-700"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>
        )}
      </div>

      {/* Meal Slot Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setSelectedSlot(null)}
          className={cn("text-xs px-3 py-1.5 rounded-full font-medium border transition-all whitespace-nowrap shrink-0",
            !selectedSlot ? "bg-teal-600 text-white border-teal-600" : "bg-white/70 dark:bg-slate-900/70 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
          )}>All Meals</button>
        {MEAL_SLOT_CONFIG.map(s => (
          <button key={s.key} onClick={() => setSelectedSlot(selectedSlot === s.key ? null : s.key)}
            className={cn("text-xs px-3 py-1.5 rounded-full font-medium border transition-all whitespace-nowrap shrink-0",
              selectedSlot === s.key ? "bg-teal-600 text-white border-teal-600" : "bg-white/70 dark:bg-slate-900/70 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
            )}>{s.emoji} {s.label}</button>
        ))}
      </div>

      {/* Recipe List */}
      <div className="space-y-2.5">
        {filteredRecipes.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <span className="text-4xl mb-3 block">🍽️</span>
            <p className="text-sm text-gray-500">No recipes found.</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add one from a video.</p>
          </GlassCard>
        ) : (
          filteredRecipes.map(recipe => renderRecipeCard(recipe))
        )}
      </div>

      {/* ── VIDEO IMPORT MODAL ── */}
      {showVideoImport && (
        <div className="fixed inset-0 z-[97] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => { if (!videoProcessing) setShowVideoImport(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 animate-fade-in shadow-xl border border-white/10 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            {videoProcessing ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center animate-pulse">
                  <Video size={28} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200">Processing Video...</p>
                  <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Extracting ingredients & steps</p>
                </div>
                <Loader2 size={20} className="text-red-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
                      <Video size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Add from Video</h3>
                      <p className="text-[10px] text-gray-400 dark:text-slate-400">Extract recipe from YouTube / Instagram</p>
                    </div>
                  </div>
                  <button onClick={() => setShowVideoImport(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <X size={16} className="text-gray-500 dark:text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Video URL</label>
                    <input
                      type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or Instagram link"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700"
                      autoFocus
                    />
                    {videoUrl && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          detectPlatform(videoUrl) === 'youtube'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-pink-100 text-pink-600'
                        )}>
                          {detectPlatform(videoUrl) === 'youtube' ? '▶ YouTube' : '◉ Instagram'}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">detected</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Video Language</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'en' as const, flag: '🇬🇧', label: 'English' },
                        { key: 'ta' as const, flag: '🇮🇳', label: 'தமிழ்' },
                        { key: 'hi' as const, flag: '🇮🇳', label: 'हिन्दी' },
                      ]).map(lang => (
                        <button key={lang.key} onClick={() => setVideoLang(lang.key)}
                          className={cn("py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-0.5",
                            videoLang === lang.key
                              ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-700"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                          )}>
                          <span className="text-base">{lang.flag}</span>
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 italic">
                      Ingredients & steps will be extracted in English regardless of video language
                    </p>
                  </div>

                  <button onClick={handleVideoImport} disabled={!videoUrl.trim()}
                    className={cn("w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                      videoUrl.trim()
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                    )}>
                    <Video size={16} /> Extract Recipe
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PDF LANGUAGE POPUP ── */}
      {pdfRecipe && (
        <div className="fixed inset-0 z-[97] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setPdfRecipe(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xs p-5 animate-fade-in shadow-xl border border-white/10 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                <Download size={24} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Download Recipe PDF</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{pdfRecipe.name}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium text-center mb-3">Choose language:</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleDownloadPDF('en')}
                className="py-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-semibold transition-all flex flex-col items-center gap-1 active:scale-95">
                <span className="text-lg">🇬🇧</span>
                English
              </button>
              <button onClick={() => handleDownloadPDF('ta')}
                className="py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-sm font-semibold transition-all flex flex-col items-center gap-1 active:scale-95">
                <span className="text-lg">🇮🇳</span>
                தமிழ்
              </button>
            </div>
            <button onClick={() => setPdfRecipe(null)} className="w-full mt-3 py-2 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-medium">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
