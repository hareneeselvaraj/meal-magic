import { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeft, Trash2, Pencil, FolderPlus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { useGrocery } from '@/context/GroceryContext';
import { type GroceryItemData, type GroceryCategory } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GroceryInventoryProps {
  triggerAddItem?: number;
}

const EMOJI_OPTIONS = ['🥬','🥕','🧅','🍅','🌾','🥛','🌶️','🍎','🥜','🧄','🍋','🧂','🫙','🥚','🧈','🍯'];

const statusBorderColor: Record<string, string> = {
  available: 'border-emerald-200/60',
  low: 'border-amber-200/60',
  missing: 'border-red-200/60',
};

const GroceryInventory = ({ triggerAddItem }: GroceryInventoryProps) => {
  const { items, addItem, updateItem, deleteItem, categories, addCategory, updateCategory, deleteCategory } = useGrocery();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // ── Item dialogs ──
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItemData | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');

  // ── Category dialogs ──
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<GroceryCategory | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('🥬');

  // External trigger
  useEffect(() => { if (triggerAddItem) { setShowAdd(true); setNewCategory(activeCategory || categories[0]?.id || ''); } }, [triggerAddItem]);

  // ── Derived data ──
  const categoryItems = activeCategory
    ? items.filter((i) => i.category === activeCategory && i.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  const getCategoryStatus = (categoryId: string): 'available' | 'low' | 'missing' => {
    const catItems = items.filter((i) => i.category === categoryId);
    if (catItems.length === 0) return 'available';
    if (catItems.some((i) => i.status === 'missing')) return 'missing';
    if (catItems.some((i) => i.status === 'low')) return 'low';
    return 'available';
  };

  // ── Item CRUD handlers ──
  const handleAddItem = () => {
    if (!newName.trim()) return;
    addItem({ name: newName.trim(), quantity: parseFloat(newQty) || 0, unit: newUnit || 'pcs', category: newCategory || activeCategory || categories[0]?.id, status: 'available' });
    setShowAdd(false); setNewName(''); setNewQty(''); setNewUnit(''); setNewCategory('');
  };

  const openEditItem = (item: GroceryItemData) => {
    setEditingItem(item); setEditName(item.name); setEditQty(String(item.quantity)); setEditUnit(item.unit);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, { name: editName.trim(), quantity: parseFloat(editQty) || 0, unit: editUnit });
    setEditingItem(null);
  };

  // ── Category CRUD handlers ──
  const handleAddCategory = () => {
    if (!catName.trim()) return;
    addCategory({ name: catName.trim(), emoji: catEmoji });
    setShowAddCat(false); setCatName(''); setCatEmoji('🥬');
  };

  const openEditCategory = (cat: GroceryCategory) => {
    setEditingCat(cat); setCatName(cat.name); setCatEmoji(cat.emoji);
  };

  const handleUpdateCategory = () => {
    if (!editingCat) return;
    updateCategory(editingCat.id, { name: catName.trim(), emoji: catEmoji });
    setEditingCat(null); setCatName(''); setCatEmoji('🥬');
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id); setDeleteCatId(null); setActiveCategory(null);
  };

  // ══════════════════════════════════════════════
  // Category Grid View
  // ══════════════════════════════════════════════
  if (!activeCategory) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Grocery Inventory</h1>
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-all"
          >
            <FolderPlus size={14} /> Category
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const catStatus = getCategoryStatus(cat.id);
            const count = items.filter((i) => i.category === cat.id).length;
            return (
              <GlassCard
                key={cat.id}
                className={cn('cursor-pointer active:scale-95 transition-all duration-200 border-2', statusBorderColor[catStatus])}
                onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {catStatus !== 'available' && <StatusBadge status={catStatus} />}
                    <button
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                    >
                      <Pencil size={11} className="text-gray-500" />
                    </button>
                    <button
                      className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setDeleteCatId(cat.id); }}
                    >
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
                <p className="text-xs text-foreground/50 mt-0.5">{count} items</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Add Category Dialog */}
        <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>Name it and pick an emoji</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name (e.g. Dairy)" />
              <div>
                <p className="text-xs text-gray-500 mb-2">Choose emoji</p>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} onClick={() => setCatEmoji(e)} className={cn('text-xl p-1 rounded-lg transition-all', catEmoji === e ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'hover:bg-gray-100')}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCategory} disabled={!catName.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update name or emoji</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" />
              <div>
                <p className="text-xs text-gray-500 mb-2">Choose emoji</p>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} onClick={() => setCatEmoji(e)} className={cn('text-xl p-1 rounded-lg transition-all', catEmoji === e ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'hover:bg-gray-100')}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateCategory} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirm */}
        <Dialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Delete Category?</DialogTitle>
              <DialogDescription>This will also delete all items in this category. This cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeleteCatId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={() => deleteCatId && handleDeleteCategory(deleteCatId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // Category Detail View
  // ══════════════════════════════════════════════
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveCategory(null)} className="w-9 h-9 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors">
          <ArrowLeft size={18} className="text-foreground/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            {activeCategoryData?.emoji} {activeCategoryData?.name}
          </h1>
          <p className="text-xs text-foreground/50">{categoryItems.length} items</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="pl-10 rounded-xl bg-white/50 backdrop-blur-sm border-white/30" />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {categoryItems.map((item) => (
          <GlassCard key={item.id} className={cn('border-l-4 transition-all', item.status === 'available' ? 'border-l-emerald-400' : item.status === 'low' ? 'border-l-amber-400' : 'border-l-red-400')}>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.quantity} {item.unit} · <span className={cn('font-medium', item.status === 'available' ? 'text-emerald-600' : item.status === 'low' ? 'text-amber-600' : 'text-red-500')}>{item.status}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status={item.status} />
                <button onClick={() => openEditItem(item)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Pencil size={13} className="text-gray-500" />
                </button>
                <button onClick={() => setDeleteItemId(item.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
        {categoryItems.length === 0 && (
          <GlassCard className="text-center py-8">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm text-foreground/40">No items found</p>
          </GlassCard>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { setNewCategory(activeCategory || ''); setShowAdd(true); }} className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all z-40">
        <Plus size={24} />
      </button>

      {/* Add Item Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>Add a new grocery item</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name (e.g. Spinach)" />
            <div className="flex gap-2">
              <Input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" />
              <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit (kg, L…)" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={cn('text-xs px-2.5 py-1 rounded-full border transition-all', (newCategory || activeCategory) === cat.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300')}>
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleAddItem} disabled={!newName.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update name, quantity, or unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Item name" />
            <div className="flex gap-2">
              <Input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} placeholder="Quantity" />
              <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="Unit" />
            </div>
            <Button onClick={handleUpdateItem} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirm */}
      <Dialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteItemId(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={() => { deleteItemId && deleteItem(deleteItemId); setDeleteItemId(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroceryInventory;
