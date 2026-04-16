import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, ArrowLeft, Trash2, Pencil, FolderPlus, ScanLine, Loader2, Check, X, ShoppingBag, Download } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { useGrocery } from '@/context/GroceryContext';
import { useNutriMom } from '@/context/NutriMomContext';
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
import { buildShoppingList } from '@/lib/shoppingList';
import { downloadSmartShoppingListPDF } from '@/lib/groceryPdfGenerator';



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

const GroceryInventory = () => {
  const { items, addItem, updateItem, deleteItem, categories, addCategory, updateCategory, deleteCategory, bulkAddItems } = useGrocery();
  const { mealPlans, recipes } = useNutriMom();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<GroceryCategory | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catIconUrl, setCatIconUrl] = useState(ICON_OPTIONS[0]);

  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedBillItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [showShoppingList, setShowShoppingList] = useState(false);

  // Derive all planned recipes from upcoming meal plans
  const plannedRecipes = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcomingPlanValues = Object.values(mealPlans).filter(p => p.date >= today);
    const recipeIds = new Set<string>();
    upcomingPlanValues.forEach(plan => {
      Object.entries(plan.meals).forEach(([slot, rId]) => {
        if (rId && !plan.completedMeals.includes(slot as any)) {
          recipeIds.add(rId);
        }
      });
    });
    return recipes.filter(r => recipeIds.has(r.id));
  }, [mealPlans, recipes]);

  const shoppingList = useMemo(() => buildShoppingList(plannedRecipes, items), [plannedRecipes, items]);



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

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    addCategory({ name: catName.trim(), iconUrl: catIconUrl, emoji: '\u2728' });
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

  const handleScanBill = async (file: File) => {
    setScanning(true);
    setScanProgress(0);
    setShowScanDialog(true);
    if (file.type.startsWith('image/')) {
      setBillPreview(URL.createObjectURL(file));
    } else {
      setBillPreview(null);
    }
    try {
      let rawText = '';
      if (file.type === 'application/pdf') {
        setScanProgress(30);
        rawText = await extractTextFromPdf(file);
        setScanProgress(100);
      } else {
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

  // ==============================================
  // CATEGORY GRID VIEW (PREMIUM)
  // ==============================================
  if (!activeCategory) {
    return (
      <div className="space-y-1 -mt-2">

        {/* Premium Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 mb-4 shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Grocery Inventory</h1>
              <p className="text-[11px] text-emerald-100 mt-0.5 font-medium">{categories.length} categories &bull; {items.length} items tracked</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowShoppingList(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-emerald-600 text-xs font-bold shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <ShoppingBag size={15} />
                To Buy {shoppingList.length > 0 && <span className="bg-emerald-100 px-1.5 py-0.5 rounded-full text-[10px] ml-0.5">{shoppingList.length}</span>}
              </button>
              <button
                onClick={() => scanInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold shadow-inner hover:bg-white/30 active:scale-95 transition-all border border-white/20"
              >
                <ScanLine size={15} />
                Scan Bill
              </button>
            </div>
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

        {/* Category Sections */}
        <div className="space-y-5 pb-20">
          {(() => {
            const snacksKeys = ['drinks', 'icecream', 'chips', 'choco', 'biscuits', 'teacoffee', 'sauces', 'sweets', 'noodles', 'frozen', 'dryfruits', 'paan'];
            const mappedKeys = ['vegetables', 'fruits', 'dairy', 'meat', 'rice', 'masalas', 'oils', 'cereals', 'millets', ...snacksKeys];
            const unmappedCategories = categories.filter(c => !mappedKeys.includes(c.id));

            const sectionConfig = [
              { title: 'Fresh Items', emoji: '🥬', gradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', accent: 'bg-green-500', cats: categories.filter(c => ['vegetables', 'fruits', 'dairy', 'meat'].includes(c.id)) },
              { title: 'Grocery & Kitchen', emoji: '🍚', gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30', accent: 'bg-amber-500', cats: categories.filter(c => ['rice', 'masalas', 'oils', 'cereals', 'millets'].includes(c.id)) },
              { title: 'Snacks & Drinks', emoji: '🍿', gradient: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', accent: 'bg-rose-500', cats: categories.filter(c => snacksKeys.includes(c.id)) },
            ];

            if (unmappedCategories.length > 0) {
              sectionConfig.push({ title: 'More Categories', emoji: '✨', gradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30', accent: 'bg-purple-500', cats: unmappedCategories });
            }

            return sectionConfig.map((section) => (
              section.cats.length > 0 && (
                <div key={section.title} className={`rounded-2xl bg-gradient-to-br ${section.gradient} p-4 shadow-sm border border-white/60 dark:border-slate-800`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1 h-5 ${section.accent} rounded-full`} />
                    <span className="text-sm">{section.emoji}</span>
                    <h2 className="text-[15px] font-extrabold text-gray-800 dark:text-slate-200 tracking-tight">{section.title}</h2>
                    <span className="ml-auto text-[10px] font-semibold text-gray-400 dark:text-slate-500">{section.cats.length} items</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {section.cats.map((cat) => {
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
                        >
                          <div className="w-full aspect-square bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5">
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
                            <h3 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 text-center leading-[1.2] break-words">{cat.name}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ));
          })()}

          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowAddCat(true)}
              className="rounded-2xl border-[1.5px] border-dashed border-gray-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all w-[110px] h-[75px] active:scale-95 duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={18} className="text-gray-400 dark:text-slate-500" />
              <span className="text-[10px] font-bold text-gray-500 dark:text-slate-500">Edit / Add</span>
            </button>
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Category</DialogTitle><DialogDescription>Name it and pick an image</DialogDescription></DialogHeader>
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
              <Button onClick={handleAddCategory} disabled={!catName.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Create Category</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shopping List Dialog */}
        <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
          <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50 sticky top-0 z-10">
              <DialogTitle className="flex items-center gap-2 m-0 text-emerald-800">
                <ShoppingBag size={20} className="text-emerald-500" />
                Smart Shopping List
              </DialogTitle>
              <button onClick={() => setShowShoppingList(false)} className="p-2 -mr-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="px-5 py-3 bg-white">
              <DialogDescription className="text-sm m-0">What you need for your planned meals minus what you already have.</DialogDescription>
            </div>
            <div className="flex-1 overflow-y-auto p-5 pt-0 space-y-4 bg-white">
              {shoppingList.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={32} />
                  </div>
                  <p className="text-gray-800 font-bold">You're all set!</p>
                  <p className="text-sm text-gray-500 mt-1">You have enough ingredients for all planned recipes.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {shoppingList.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-3 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-gray-800 capitalize text-sm">{item.name}</span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] whitespace-nowrap ml-2">
                          {item.displayQty}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">For:</span>
                        {item.forRecipes.map((r, i) => (
                          <span key={i} className="text-[9px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {shoppingList.length > 0 && (
                <div className="pt-2 sticky bottom-0 bg-white border-t border-gray-100 pb-2">
                  <button
                    onClick={() => downloadSmartShoppingListPDF(shoppingList)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <Download size={16} /> Download as PDF
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Edit Category</DialogTitle><DialogDescription>Update name or image</DialogDescription></DialogHeader>
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
              <Button onClick={handleUpdateCategory} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirm */}
        <Dialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Delete Category?</DialogTitle><DialogDescription>This will also delete all items in this category.</DialogDescription></DialogHeader>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeleteCatId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={() => deleteCatId && handleDeleteCategory(deleteCatId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan Bill Dialog */}
        <Dialog open={showScanDialog} onOpenChange={(open) => { if (!scanning) { setShowScanDialog(open); if (!open) { setParsedItems([]); setSelectedItems(new Set()); setBillPreview(null); } } }}>
          <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScanLine size={20} className="text-emerald-500" />
                {scanning ? 'Scanning Bill...' : `Scanned Items (${parsedItems.length})`}
              </DialogTitle>
              <DialogDescription>{scanning ? 'Reading your bill...' : 'Select items to import into your grocery inventory'}</DialogDescription>
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
                {billPreview && <img src={billPreview} alt="Bill preview" className="w-32 rounded-lg opacity-50 mt-2" />}
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
                      <div key={idx} onClick={() => toggleItem(idx)} className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border',
                        selectedItems.has(idx) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent opacity-50'
                      )}>
                        <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          selectedItems.has(idx) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                        )}>
                          {selectedItems.has(idx) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.quantity} {item.unit} {item.price ? `\u2022 \u20B9${item.price}` : ''}</p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {catData?.name || item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button variant="outline" onClick={() => { setShowScanDialog(false); setParsedItems([]); setSelectedItems(new Set()); setBillPreview(null); }} className="flex-1 rounded-xl">Cancel</Button>
                  <Button onClick={handleImportSelected} disabled={selectedItems.size === 0} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                    Import {selectedItems.size} Items
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Add Item</DialogTitle><DialogDescription>Add an item to your grocery list</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" />
              <div className="flex gap-2">
                <Input value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" type="number" className="flex-1" />
                <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit" className="flex-1" />
              </div>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button onClick={handleAddItem} disabled={!newName.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ==============================================
  // CATEGORY DETAIL VIEW
  // ==============================================
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveCategory(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{activeCategoryData?.name}</h1>
          <p className="text-xs text-muted-foreground">{categoryItems.length} items</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => activeCategoryData && openEditCategory(activeCategoryData)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><Pencil size={16} /></button>
          <button onClick={() => activeCategory && setDeleteCatId(activeCategory)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="pl-9 rounded-xl" />
      </div>

      <div className="space-y-2 pb-20">
        {categoryItems.map((item) => (
          <GlassCard key={item.id} className={cn('p-3 flex items-center gap-3 border', statusBorderColor[item.status])}>
            <StatusBadge status={item.status} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
            </div>
            <button onClick={() => openEditItem(item)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
            <button onClick={() => setDeleteItemId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
          </GlassCard>
        ))}

        {categoryItems.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">No items found</p>
          </div>
        )}

        <button onClick={() => { setShowAdd(true); setNewCategory(activeCategory || ''); }} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
          <Plus size={16} className="inline mr-1" /> Add Item
        </button>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle><DialogDescription>Update quantity or details</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Item name" />
            <div className="flex gap-2">
              <Input value={editQty} onChange={(e) => setEditQty(e.target.value)} placeholder="Qty" type="number" className="flex-1" />
              <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="Unit" className="flex-1" />
            </div>
            <Button onClick={handleUpdateItem} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirm */}
      <Dialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Delete Item?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteItemId(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={() => { if (deleteItemId) { deleteItem(deleteItemId); setDeleteItemId(null); } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle><DialogDescription>Update name or image</DialogDescription></DialogHeader>
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
            <Button onClick={handleUpdateCategory} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirm */}
      <Dialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Delete Category?</DialogTitle><DialogDescription>This will also delete all items.</DialogDescription></DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteCatId(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={() => deleteCatId && handleDeleteCategory(deleteCatId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Add Item</DialogTitle><DialogDescription>Add a new item to {activeCategoryData?.name}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" />
            <div className="flex gap-2">
              <Input value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" type="number" className="flex-1" />
              <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit" className="flex-1" />
            </div>
            <Button onClick={handleAddItem} disabled={!newName.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroceryInventory;
