import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import GroceryItem from '@/components/GroceryItem';
import { groceryItems as initialItems, type GroceryItemData } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GroceryInventory = () => {
  const [items, setItems] = useState<GroceryItemData[]>(initialItems);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<GroceryItemData | null>(null);
  const [editQty, setEditQty] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (qty: number): GroceryItemData['status'] => {
    if (qty <= 0) return 'missing';
    if (qty <= 0.5) return 'low';
    return 'available';
  };

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
    if (!newName.trim()) return;
    const qty = parseFloat(newQty) || 0;
    const newItem: GroceryItemData = {
      id: `g${Date.now()}`,
      name: newName.trim(),
      quantity: qty,
      unit: newUnit || 'pcs',
      status: getStatus(qty),
    };
    setItems((prev) => [newItem, ...prev]);
    setShowAdd(false);
    setNewName('');
    setNewQty('');
    setNewUnit('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Grocery Inventory</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="pl-10 rounded-xl bg-white/50 backdrop-blur-sm border-white/30"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <GroceryItem key={item.id} item={item} onEdit={handleEdit} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors z-40"
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
            <DialogTitle>Add Grocery Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory</DialogDescription>
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
