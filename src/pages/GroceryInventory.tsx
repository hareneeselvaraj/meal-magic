import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ArrowLeft, Trash2, Pencil, FolderPlus, ScanLine, Loader2, Check, X } from 'lucide-react';
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
import { parseBillText, type ParsedBillItem } from '@/lib/billParser';
import { extractTextFromPdf } from '@/lib/pdfExtractor';
import Tesseract from 'tesseract.js';

interface GroceryInventoryProps {
  triggerAddItem?: number;
}

const ICON_OPTIONS = [
  '/categories/veg.jpg',
  '/categories/dairy.jpg',
  '/categories/cereals.jpg',
  '/categories/rice.jpg',
  '/categories/fruits.jpg',
  '/categories/meat.jpg',
  '/categories/drinks.jpg',
  '/categories/icecream.jpg',
  '/categories/chips.jpg',
  '/categories/choco.jpg',
  '/categories/oils.jpg',
  '/categories/masalas.jpg'
];

const statusBorderColor: Record<string, string> = {
  available: 'border-emerald-200/60',
  low: 'border-amber-200/60',
  missing: 'border-red-200/60',
};

const GroceryInventory = ({ triggerAddItem }: GroceryInventoryProps) => {
  const { items, addItem, updateItem, deleteItem, categories, addCategory, updateCategory, deleteCategory, bulkAddItems } = useGrocery();

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
  const [catIconUrl, setCatIconUrl] = useState(ICON_OPTIONS[0]);

  // ── Bill Scanner state ──
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedBillItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

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
    addCategory({ name: catName.trim(), iconUrl: catIconUrl, emoji: '✨' });
    setShowAddCat(false); setCatName(''); setCatIconUrl(ICON_OPTIONS[0]);
  };

  const openEditCategory = (cat: GroceryCategory) => {
    setEditingCat(cat); setCatName(cat.name); setCatIconUrl(cat.iconUrl);
  };

  const handleUpdateCategory = () => {
    if (!editingCat) return;
    updateCategory(editingCat.id, { name: catName.trim(), iconUrl: catIconUrl });
    setEditingCat(null); setCatName(''); setCatIconUrl(ICON_OPTIONS[0]);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id); setDeleteCatId(null); setActiveCategory(null);
  };

  // ── Bill Scanner handler ──
  const handleScanBill = async (file: File) => {
    setScanning(true);
    setScanProgress(0);
    setShowScanDialog(true);

    // Show preview for images only
    if (file.type.startsWith('image/')) {
      setBillPreview(URL.createObjectURL(file));
    } else {
      setBillPreview(null);
    }

    try {
      let rawText = '';

      if (file.type === 'application/pdf') {
        // PDF: Direct text extraction (much more accurate!)
        setScanProgress(30);
        rawText = await extractTextFromPdf(file);
        setScanProgress(100);
      } else {
        // Image: OCR with Tesseract
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setScanProgress(Math.round(m.progress * 100));
            }
          },
        });
        rawText = result.data.text;
      }

      const parsed = parseBillText(rawText);
      setParsedItems(parsed);
      setSelectedItems(new Set(parsed.map((_, i) => i)));
    } catch (err) {
      console.error('Scan failed:', err);
      setParsedItems([]);
    } finally {
      setScanning(false);
    }
  };

  const handleImportSelected = () => {
    const toImport = parsedItems
      .filter((_, i) => selectedItems.has(i))
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        status: 'available' as const,
      }));
    bulkAddItems(toImport);
    setShowScanDialog(false);
    setParsedItems([]);
    setSelectedItems(new Set());
    setBillPreview(null);
  };

  const toggleItem = (idx: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  // ═════════════════════�   if (!activeCategory) {
    return (
      <div className="space-y-1 -mt-2">

        {/* ═══ Premium Header Banner ═══ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 mb-4 shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Grocery Inventory</h1>
              <p className="text-[11px] text-emerald-100 mt-0.5 font-medium">{categories.length} categories • {items.length} items tracked</p>
            </div>
            <button
              onClick={() => scanInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold shadow-inner hover:bg-white/30 active:scale-95 transition-all border border-white/20"
            >
              <ScanLine size={15} />
              Scan Bill
            </button>
          </div>
          <input
            ref={scanInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleScanBill(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* ═══ Category Sections ═══ */}
        <div className="space-y-5 pb-20">
          {(() => {
            const snacksKeys = ['drinks', 'icecream', 'chips', 'choco', 'biscuits', 'teacoffee', 'sauces', 'sweets', 'noodles', 'frozen', 'dryfruits', 'paan'];
            const mappedKeys = ['vegetables', 'fruits', 'dairy', 'meat', 'rice', 'masalas', 'oils', 'cereals', 'millets', ...snacksKeys];
            const unmappedCategories = categories.filter(c => !mappedKeys.includes(c.id));
            
            const sectionConfig = [
              { title: "Fresh Items", emoji: "🥬", gradient: "from-green-50 to-emerald-50", accent: "bg-green-500", cats: categories.filter(c => ['vegetables', 'fruits', 'dairy', 'meat'].includes(c.id)) },
              { title: "Grocery & Kitchen", emoji: "🍚", gradient: "from-amber-50 to-orange-50", accent: "bg-amber-500", cats: categories.filter(c => ['rice', 'masalas', 'oils', 'cereals', 'millets'].includes(c.id)) },
              { title: "Snacks & Drinks", emoji: "🍿", gradient: "from-rose-50 to-pink-50", accent: "bg-rose-500", cats: categories.filter(c => snacksKeys.includes(c.id)) },
            ];

            if (unmappedCategories.length > 0) {
              sectionConfig.push({ title: "More Categories", emoji: "✨", gradient: "from-purple-50 to-indigo-50", accent: "bg-purple-500", cats: unmappedCategories });
            }

            return sectionConfig.map((section, sIdx) => (
              section.cats.length > 0 && (
                <div key={section.title} className={`rounded-2xl bg-gradient-to-br ${section.gradient} p-4 shadow-sm border border-white/60`} style={{ animationDelay: `${sIdx * 80}ms` }}>
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1 h-5 ${section.accent} rounded-full`} />
                    <span className="text-sm">{section.emoji}</span>
                    <h2 className="text-[15px] font-extrabold text-gray-800 tracking-tight">{section.title}</h2>
                    <span className="ml-auto text-[10px] font-semibold text-gray-400">{section.cats.length} items</span>
                  </div>
                  
                  {/* Category Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {section.cats.map((cat, cIdx) => {
                      const catStatus = getCategoryStatus(cat.id);
                      
                      let displayUrl = (cat as any).iconUrl;
                      if (displayUrl && displayUrl.includes('icons8.com')) {
                        if (displayUrl.includes('carrot') || displayUrl.includes('leaf')) displayUrl = '/categories/veg.jpg';
                        else if (displayUrl.includes('apple')) displayUrl = '/categories/fruits.jpg';
                        else if (displayUrl.includes('milk') || displayUrl.includes('egg') || displayUrl.includes('butter')) displayUrl = '/categories/dairy.jpg';
                        else if (displayUrl.includes('wheat')) displayUrl = '/categories/rice.jpg';
                        else if (displayUrl.includes('chili')) displayUrl = '/categories/masalas.jpg';
                      }

                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                          className="group flex flex-col items-center cursor-pointer active:scale-[0.92] transition-all duration-200"
                          style={{ animationDelay: `${cIdx * 40}ms` }}
                        >
                          <div className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5">
                            {catStatus !== 'available' && (
                              <div className="absolute top-1 right-1 scale-75 origin-top-right z-20">
                                <StatusBadge status={catStatus} />
                              </div>
                            )}
                            {displayUrl ? (
                              <img src={displayUrl} alt={cat.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.06] transition-transform duration-500 ease-out" />
                            ) : (
                              <span className="text-3xl filter drop-shadow-sm z-10 group-hover:scale-110 transition-transform duration-500">{cat.emoji}</span>
                            )}
                          </div>
                          <div className="w-full flex-1 pt-1.5 px-0.5">
                            <h3 className="text-[11px] font-bold text-gray-700 text-center leading-[1.2] break-words">{cat.name}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))
          })()}

          {/* Add Category Button */}
          <div className="flex justify-center mt-3">
             <button
               onClick={() => setShowAddCat(true)}
               className="rounded-2xl border-[1.5px] border-dashed border-gray-300 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-all w-[110px] h-[75px] active:scale-95 duration-200 shadow-sm hover:shadow-md"
             >
               <Plus size={18} className="text-gray-400" />
               <span className="text-[10px] font-bold text-gray-500">Edit / Add</span>
             </button>
          </div>
        </div>ation-200 mt-2 shadow-sm"
             >
               <Plus size={18} className="text-gray-400" />
               <span className="text-[10px] font-bold text-gray-500">Edit / Add</span>
             </button>
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>Name it and pick an image</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name (e.g. Dairy)" />
              <div>
                <p className="text-xs text-gray-500 mb-2">Choose Image</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((url) => (
                    <button key={url} onClick={() => setCatIconUrl(url)} className={cn('rounded-xl overflow-hidden transition-all', catIconUrl === url ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'hover:opacity-80')}>
                      <img src={url} alt="category" className="w-full aspect-square object-cover" />
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
              <DialogDescription>Update name or image</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" />
              <div>
                <p className="text-xs text-gray-500 mb-2">Choose Image</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((url) => (
                    <button key={url} onClick={() => setCatIconUrl(url)} className={cn('rounded-xl overflow-hidden transition-all', catIconUrl === url ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'hover:opacity-80')}>
                      <img src={url} alt="category" className="w-full aspect-square object-cover" />
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

        {/* ═══ Scan Bill Dialog ═══ */}
        <Dialog open={showScanDialog} onOpenChange={(open) => { if (!scanning) { setShowScanDialog(open); if (!open) { setParsedItems([]); setSelectedItems(new Set()); setBillPreview(null); } } }}>
          <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScanLine size={20} className="text-emerald-500" />
                {scanning ? 'Scanning Bill...' : `Scanned Items (${parsedItems.length})`}
              </DialogTitle>
              <DialogDescription>
                {scanning ? 'Reading your bill using OCR...' : 'Select items to import into your grocery inventory'}
              </DialogDescription>
            </DialogHeader>

            {scanning ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 size={40} className="animate-spin text-emerald-500" />
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">{scanProgress}% complete</p>
                </div>
                {billPreview && (
                  <img src={billPreview} alt="Bill preview" className="w-32 rounded-lg opacity-50 mt-2" />
                )}
              </div>
            ) : parsedItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No items could be extracted.</p>
                <p className="text-xs mt-1">Try a clearer photo of the bill.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh]">
                  {parsedItems.map((item, idx) => {
                    const catData = categories.find(c => c.id === item.category);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItem(idx)}
                        className={cn(
                          'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border',
                          selectedItems.has(idx)
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-transparent opacity-50'
                        )}
                      >
                        <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          selectedItems.has(idx) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                        )}>
                          {selectedItems.has(idx) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.quantity} {item.unit} {item.price ? `• ₹${item.price}` : ''}</p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {catData?.name || item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => { setShowScanDialog(false); setParsedItems([]); setSelectedItems(new Set()); setBillPreview(null); }}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportSelected}
                    disabled={selectedItems.size === 0}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Import {selectedItems.size} Items
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog (Global support) */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Item</DialogTitle>
              <DialogDescription>Add a new grocery item</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name (e.g. Spinach)" />
              <div className="flex gap-2">
                <Input type="number" step="any" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" />
                <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit (kg, L…)" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={cn('text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5', (newCategory || activeCategory) === cat.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300')}>
                      {/* Handle both icon formats safely inside Add Item Category picker */}
                      {(cat as any).iconUrl ? (
                        <img src={(cat as any).iconUrl} alt="icon" className="w-3.5 h-3.5 object-contain" />
                      ) : (
                        <span className="text-[10px]">{cat.emoji}</span>
                      )}
                      {cat.name}
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
            <img src={activeCategoryData?.iconUrl} alt="icon" className="w-6 h-6 object-contain" />
            {activeCategoryData?.name}
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
                  <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={cn('text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5', (newCategory || activeCategory) === cat.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300')}>
                    <img src={cat.iconUrl} alt="icon" className="w-3.5 h-3.5 object-contain" /> {cat.name}
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
