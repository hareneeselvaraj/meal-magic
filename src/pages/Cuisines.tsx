import { useState } from 'react';
import { useNutriMom } from '@/context/NutriMomContext';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { Globe, Plus, Edit2, Trash2, X, Check, ChefHat } from 'lucide-react';

const Cuisines = () => {
  const { cuisines, addCuisine, updateCuisine, deleteCuisine, recipes } = useNutriMom();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTamil, setFormTamil] = useState('');
  const [formEmoji, setFormEmoji] = useState('🍽️');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activeCuisines = cuisines.filter(c => c.isActive);

  const getRecipeCount = (cuisineId: string) => recipes.filter(r => r.cuisineId === cuisineId).length;

  const openAddForm = () => {
    setEditingId(null);
    setFormName('');
    setFormTamil('');
    setFormEmoji('🍽️');
    setShowForm(true);
  };

  const openEditForm = (cuisine: typeof cuisines[0]) => {
    setEditingId(cuisine.id);
    setFormName(cuisine.name);
    setFormTamil(cuisine.nameInTamil);
    setFormEmoji(cuisine.emoji);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;

    if (editingId) {
      updateCuisine(editingId, { name: formName, nameInTamil: formTamil, emoji: formEmoji });
    } else {
      addCuisine({
        name: formName,
        nameInTamil: formTamil,
        emoji: formEmoji,
        isDefault: false,
        isActive: true,
        createdBy: 'user',
      });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteCuisine(id);
    setDeleteConfirm(null);
  };

  const emojiOptions = ['🍽️', '🥘', '🍜', '🥗', '🧆', '🍕', '🥟', '🌮', '🍱', '🥙', '🫕', '🥖'];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe size={22} className="text-emerald-500" />
          Cuisines
        </h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus size={14} /> Add Cuisine
        </button>
      </div>

      {/* Cuisine Grid */}
      <div className="grid grid-cols-2 gap-3">
        {activeCuisines.map(cuisine => {
          const recipeCount = getRecipeCount(cuisine.id);
          const isDeleting = deleteConfirm === cuisine.id;

          return (
            <GlassCard
              key={cuisine.id}
              className={cn(
                "p-4 relative overflow-hidden transition-all",
                isDeleting && "ring-2 ring-rose-300"
              )}
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full" />

              <div className="relative">
                <span className="text-4xl block mb-2">{cuisine.emoji}</span>
                <h3 className="text-sm font-bold text-gray-800">{cuisine.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{cuisine.nameInTamil}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ChefHat size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-gray-500">{recipeCount} recipes</span>
                </div>

                {isDeleting ? (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleDelete(cuisine.id)}
                      className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-semibold"
                    >Delete</button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-[11px] font-semibold"
                    >Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => openEditForm(cuisine)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-emerald-100 transition-all"
                    >
                      <Edit2 size={13} className="text-gray-500" />
                    </button>
                    {!cuisine.isDefault && (
                      <button
                        onClick={() => setDeleteConfirm(cuisine.id)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={13} className="text-gray-500" />
                      </button>
                    )}
                    {cuisine.isDefault && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Default</span>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}

        {/* Add Card */}
        <button
          onClick={openAddForm}
          className="rounded-2xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
        >
          <Plus size={24} className="text-gray-300" />
          <span className="text-xs text-gray-400 font-medium">Add New</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[97] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 animate-fade-in shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Cuisine' : 'New Cuisine'}
              </h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Emoji Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map(e => (
                  <button
                    key={e}
                    onClick={() => setFormEmoji(e)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all",
                      formEmoji === e
                        ? "bg-emerald-100 ring-2 ring-emerald-400 scale-110"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >{e}</button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g., Mexican"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {/* Tamil Name */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Name in Tamil</label>
              <input
                type="text"
                value={formTamil}
                onChange={e => setFormTamil(e.target.value)}
                placeholder="e.g., மெக்ஸிகன்"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                formName.trim()
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Check size={16} />
              {editingId ? 'Save Changes' : 'Add Cuisine'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuisines;
