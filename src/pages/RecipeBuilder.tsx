import { useState, useRef } from 'react';
import { ArrowLeft, ImagePlus, Plus, Trash2, Clock, ChefHat, Link2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FlavorTag, MealSlot, Recipe } from '@/data/mockData';
import { useRecipes } from '@/context/RecipeContext';

interface RecipeBuilderProps {
  onClose: () => void;
  recipe?: Recipe; // if provided, entering edit mode
}

interface IngredientEntry {
  name: string;
  qty: string;
}

const mealSlots: { value: MealSlot; label: string; emoji?: string; iconUrl?: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'snack', label: 'Snack', emoji: '🍵' },
  { value: 'dinner', label: 'Dinner', iconUrl: 'https://img.icons8.com/fluency/48/night.png' },
];

const flavorTags: { value: FlavorTag; label: string; color: string }[] = [
  { value: 'Spicy', label: '🌶 Spicy', color: 'bg-red-100 text-red-600 border-red-200' },
  { value: 'Sweet', label: '🍯 Sweet', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { value: 'Light', label: '🍃 Light', color: 'bg-sky-100 text-sky-600 border-sky-200' },
  { value: 'Balanced', label: '⚖️ Balanced', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
];

const RecipeBuilder = ({ onClose, recipe: editRecipe }: RecipeBuilderProps) => {
  const { addRecipe, updateRecipe } = useRecipes();
  const [name, setName] = useState(editRecipe?.name ?? '');
  const [slot, setSlot] = useState<MealSlot>(editRecipe?.mealSlot ?? 'lunch');
  const [tags, setTags] = useState<FlavorTag[]>(editRecipe?.tags ?? []);
  const [prepTime, setPrepTime] = useState(editRecipe ? String(editRecipe.prepTimeMinutes) : '');
  const [ingredients, setIngredients] = useState<IngredientEntry[]>(editRecipe?.ingredients ?? [{ name: '', qty: '' }]);
  const [instructions, setInstructions] = useState<string[]>(editRecipe?.instructions ?? ['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: FlavorTag) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', qty: '' }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: 'name' | 'qty', value: string) => {
    const updated = [...ingredients];
    updated[i][field] = value;
    setIngredients(updated);
  };

  const addStep = () => setInstructions([...instructions, '']);
  const removeStep = (i: number) => setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) => {
    const updated = [...instructions];
    updated[i] = value;
    setInstructions(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      extractFromImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractFromImage = async (base64: string) => {
    setIsExtracting(true);
    setExtractionStatus('Analyzing image...');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setTimeout(() => {
          setIngredients([
            { name: 'Onions', qty: '100 g' }, { name: 'Tomatoes', qty: '80 g' },
            { name: 'Rice', qty: '200 g' }, { name: 'Turmeric Powder', qty: '1 tsp' },
          ]);
          setIsExtracting(false);
          setExtractionStatus('Extracted (mock)');
        }, 1500);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'Extract the recipe from this image. Return ONLY valid JSON: {"name":"Recipe Name","ingredients":[{"name":"Onion","qty":"100 g"}],"instructions":["Step 1","Step 2"],"prepTimeMinutes":15}. No markdown.' },
                { inlineData: { mimeType: 'image/jpeg', data: base64.split(',')[1] } },
              ],
            }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.name) setName(parsed.name);
      if (Array.isArray(parsed.ingredients)) setIngredients(parsed.ingredients);
      if (Array.isArray(parsed.instructions)) setInstructions(parsed.instructions);
      if (parsed.prepTimeMinutes) setPrepTime(String(parsed.prepTimeMinutes));
      setExtractionStatus('✅ Recipe extracted!');
    } catch (err) {
      console.error('Extraction failed:', err);
      setExtractionStatus('❌ Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  // ─── YouTube / Instagram URL extraction ───
  const extractFromVideoUrl = async () => {
    if (!videoUrl.trim()) return;
    setIsExtractingUrl(true);
    setExtractionStatus('🎬 AI analyzing video recipe...');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setTimeout(() => {
          setName('Masala Dosa (from video)');
          setIngredients([
            { name: 'Dosa Batter', qty: '200 g' }, { name: 'Potato', qty: '150 g' },
            { name: 'Onions', qty: '50 g' }, { name: 'Mustard Seeds', qty: '1 tsp' },
            { name: 'Turmeric Powder', qty: '1 tsp' }, { name: 'Green Chilies', qty: '2 pcs' },
          ]);
          setInstructions([
            'Boil potatoes, mash coarsely.',
            'Temper mustard seeds, add onions and turmeric. Add potato.',
            'Pour dosa batter on hot tawa, spread thin.',
            'Add potato filling, fold and serve crispy.',
          ]);
          setPrepTime('25');
          setIsExtractingUrl(false);
          setExtractionStatus('✅ Recipe extracted from video!');
        }, 2000);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `This is a recipe video URL: ${videoUrl}

Based on this URL (it's a YouTube or Instagram recipe video), extract the recipe details. Use your knowledge of popular recipe videos and the URL title/metadata to determine the recipe.

Return ONLY valid JSON in this exact format:
{"name":"Recipe Name","ingredients":[{"name":"Ingredient","qty":"100 g"}],"instructions":["Step 1","Step 2","Step 3"],"prepTimeMinutes":20,"tags":["Spicy"]}

Tags should be from: Spicy, Sweet, Light, Balanced. No markdown, just raw JSON.`
                },
              ],
            }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.name) setName(parsed.name);
      if (Array.isArray(parsed.ingredients)) setIngredients(parsed.ingredients);
      if (Array.isArray(parsed.instructions)) setInstructions(parsed.instructions);
      if (parsed.prepTimeMinutes) setPrepTime(String(parsed.prepTimeMinutes));
      if (Array.isArray(parsed.tags)) setTags(parsed.tags);
      setExtractionStatus('✅ Recipe extracted from video!');
    } catch (err) {
      console.error('Video extraction failed:', err);
      setExtractionStatus('❌ Could not extract from video');
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handleSave = () => {
    const payload = {
      name, mealSlot: slot, tags,
      prepTimeMinutes: parseInt(prepTime) || 15,
      ingredients: ingredients.filter((i) => i.name.trim()),
      instructions: instructions.filter((s) => s.trim()),
    };
    if (editRecipe) {
      updateRecipe(editRecipe.id, payload);
    } else {
      addRecipe(payload);
    }
    onClose();
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center active:scale-90 transition-all touch-manipulation">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><ChefHat size={20} /> {editRecipe ? 'Edit Recipe' : 'Create Recipe'}</h1>
          <p className="text-[11px] text-foreground/40">{editRecipe ? 'Update recipe details' : 'Build your own healthy recipe'}</p>
        </div>
      </div>

      {/* Recipe Name */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3.5 space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recipe Name</label>
        <Input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spicy Millet Bowl"
          className="bg-white/60 border-gray-200 rounded-xl text-sm font-medium h-10"
        />
      </div>

      {/* Meal Slot & Tags — compact 2x2 grid on mobile */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3.5 space-y-2.5">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meal Type</label>
        <div className="grid grid-cols-4 gap-1.5">
          {mealSlots.map((s) => (
            <button
              key={s.value} onClick={() => setSlot(s.value)}
              className={cn(
                'py-2 rounded-xl text-[11px] font-semibold border transition-all touch-manipulation',
                slot === s.value
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-white/60 text-gray-500 border-gray-200'
              )}
            >
              {s.emoji}<br />{s.label}
            </button>
          ))}
        </div>

        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flavor</label>
        <div className="flex gap-1.5 flex-wrap">
          {flavorTags.map((t) => (
            <button
              key={t.value} onClick={() => toggleTag(t.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all touch-manipulation',
                tags.includes(t.value) ? t.color + ' border-current' : 'bg-gray-50 text-gray-400 border-gray-200'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <Input
            value={prepTime} onChange={(e) => setPrepTime(e.target.value)}
            placeholder="Prep time (min)" type="number"
            className="bg-white/60 border-gray-200 rounded-xl text-sm w-36 h-9"
          />
        </div>
      </div>

      {/* ─── Video URL Extraction ─── */}
      <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl border border-rose-100/50 p-3.5 space-y-2.5">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 size={12} /> Import from YouTube / Instagram
        </label>
        <div className="flex gap-2">
          <Input
            value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste video URL here..."
            className="flex-1 bg-white/80 border-rose-200 rounded-xl text-sm h-10"
          />
          <Button
            onClick={extractFromVideoUrl}
            disabled={!videoUrl.trim() || isExtractingUrl}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 h-10 text-xs font-semibold disabled:opacity-40 touch-manipulation"
          >
            {isExtractingUrl ? <Loader2 size={16} className="animate-spin" /> : '🤖 Extract'}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400">AI will extract recipe name, ingredients, and steps from the video</p>
      </div>

      {/* ─── Image Upload ─── */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3.5 space-y-2.5">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Upload Recipe Image</label>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />

        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-100">
            <img src={imagePreview} alt="Recipe" className="w-full h-32 object-cover" />
            {isExtracting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-sm font-medium animate-pulse">🤖 Extracting...</div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-1.5 text-gray-400 active:border-emerald-300 active:text-emerald-500 transition-all touch-manipulation"
          >
            <ImagePlus size={24} />
            <span className="text-[11px] font-medium">Upload screenshot or photo</span>
          </button>
        )}

        {extractionStatus && (
          <p className="text-[11px] text-center font-medium text-gray-500">{extractionStatus}</p>
        )}
      </div>

      {/* ─── Manual Ingredients ─── */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ingredients</label>
          <button onClick={addIngredient} className="text-emerald-600 flex items-center gap-0.5 text-[11px] font-semibold touch-manipulation">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="space-y-1.5">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <Input
                value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                placeholder="Ingredient"
                className="flex-1 bg-white/60 border-gray-200 rounded-xl text-sm h-9"
              />
              <Input
                value={ing.qty} onChange={(e) => updateIngredient(i, 'qty', e.target.value)}
                placeholder="Qty"
                className="w-20 bg-white/60 border-gray-200 rounded-xl text-sm h-9"
              />
              {ingredients.length > 1 && (
                <button onClick={() => removeIngredient(i)} className="text-red-400 active:text-red-500 touch-manipulation p-1">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Steps ─── */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Steps</label>
          <button onClick={addStep} className="text-emerald-600 flex items-center gap-0.5 text-[11px] font-semibold touch-manipulation">
            <Plus size={13} /> Add Step
          </button>
        </div>
        <div className="space-y-1.5">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold mt-2 shrink-0">{i + 1}</span>
              <Input
                value={step} onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                className="flex-1 bg-white/60 border-gray-200 rounded-xl text-sm h-9"
              />
              {instructions.length > 1 && (
                <button onClick={() => removeStep(i)} className="text-red-400 active:text-red-500 mt-2 touch-manipulation p-1">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave} disabled={!name.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-5 text-sm font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-40 touch-manipulation"
      >
        <ChefHat size={16} className="mr-2" /> {editRecipe ? 'Update Recipe' : 'Save Recipe'}
      </Button>
    </div>
  );
};

export default RecipeBuilder;
