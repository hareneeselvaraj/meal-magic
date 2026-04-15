import { useState } from 'react';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import GroceryItem from '@/components/GroceryItem';
import StatusBadge from '@/components/StatusBadge';
import {
  groceryItems as initialItems,
  groceryCategories,
  type GroceryItemData,
} from '@/data/mockData';
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

const GroceryInventory = () => {
  const [items, setItems] = useState<GroceryItemData[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<GroceryItemData | null>(null);
  const [editQty, setEditQty] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const getStatus = (qty: number): GroceryItemData['status'] => {
    if (qty <= 0) return 'missing';
    if (qty <= 0.5) return 'low';
    return 'available';
  };

  const getCategoryStatus = (categoryId: string): 'available' | 'low' | 'missing' => {
    const catItems = items.filter((i) => i.category === categoryId);
    if (catItems.some((i) => i.status === 'missing')) return 'missing';
    if (catItems.some((i) => i.status === 'low')) return 'low';
    return 'available';
  };

  const categoryItems = activeCategory
    ? items.filter(
        (i) =>
          i.category === activeCategory &&
          i.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const activeCategoryData = groceryCategories.find((c) => c.id === activeCategory);

  const handleEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setEditingItem(item);
      setEditQty(String(item.quantity));
    }
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const qty = parseFloat(editQty) || 0;
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id ? { ...i, quantity: qty, status: getStatus(qty) } : i
      )
    );
    setEditingItem(null);
  };

  const addItem = () => {
    if (!newName.trim() || !activeCategory) return;
    const qty = parseFloat(newQty) || 0;
    const newItem: GroceryItemData = {
      id: `g${Date.now()}`,
      name: newName.trim(),
      quantity: qty,
      unit: newUnit || 'pcs',
      status: getStatus(qty),
      category: activeCategory,
    };
    setItems((prev) => [newItem, ...prev]);
    setShowAdd(false);
    setNewName('');
    setNewQty('');
    setNewUnit('');
  };

  const statusBorderColor = {
    available: 'border-status-available/30',
    low: 'border-status-low/30',
    missing: 'border-status-missing/30',
  };

  // Category grid view
  if (!activeCategory) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-foreground">Grocery Inventory</h1>
        <div className="grid grid-cols-2 gap-3">
          {groceryCategories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat.id);
            const catStatus = getCategoryStatus(cat.id);
            return (
              <GlassCard
                key={cat.id}
                className={cn(
                  'cursor-pointer active:scale-95 transition-all duration-200 border-2',
                  statusBorderColor[catStatus]
                )}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearch('');
                }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.emoji}</span>
                  {catStatus !== 'available' && (
                    <StatusBadge status={catStatus} />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground mt-2">{cat.name}</h3>
                <p className="text-xs text-foreground/50 mt-0.5">{catItems.length} items</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  }

  // Category detail view
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className="w-9 h-9 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
        >
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="pl-10 rounded-xl bg-white/50 backdrop-blur-sm border-white/30"
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {categoryItems.map((item) => (
          <GroceryItem key={item.id} item={item} onEdit={handleEdit} />
        ))}
        {categoryItems.length === 0 && (
          <GlassCard className="text-center py-8">
            <p className="text-sm text-foreground/40">No items found</p>
          </GlassCard>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.name}</DialogTitle>
            <DialogDescription>Update the quantity for this item</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              placeholder="Quantity"
            />
            <Button onClick={saveEdit} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add to {activeCategoryData?.name}</DialogTitle>
            <DialogDescription>Add a new item to this category</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" />
            <div className="flex gap-2">
              <Input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" />
              <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit (kg, L...)" />
            </div>
            <Button onClick={addItem} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroceryInventory;
