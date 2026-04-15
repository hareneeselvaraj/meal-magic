import { useState, useCallback } from 'react';
import FloatingBackground from '@/components/FloatingBackground';
import BottomNav, { type TabId } from '@/components/BottomNav';
import Home from './Home';
import MealPlanner from './MealPlanner';
import GroceryInventory from './GroceryInventory';
import UploadInvoice from './UploadInvoice';
import History from './History';
import RecipeBuilder from './RecipeBuilder';
import NutrientLog from './NutrientLog';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Trigger counters
  const [triggerLogMeal, setTriggerLogMeal] = useState(0);
  const [triggerAddItem, setTriggerAddItem] = useState(0);
  const [showScan, setShowScan] = useState(false);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const [showNutrientLog, setShowNutrientLog] = useState(false);

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'Recipe':
        setShowScan(false);
        setShowNutrientLog(false);
        setShowRecipeBuilder(true);
        break;
      case 'Scan':
        setShowRecipeBuilder(false);
        setShowNutrientLog(false);
        setShowScan(true);
        break;
      case 'Grocery':
        setShowScan(false);
        setShowRecipeBuilder(false);
        setShowNutrientLog(false);
        setActiveTab('grocery');
        setTriggerAddItem((n) => n + 1);
        break;
      case 'Log':
        setShowScan(false);
        setShowRecipeBuilder(false);
        setShowNutrientLog(true);
        break;
    }
  }, []);

  const renderScreen = () => {
    if (showRecipeBuilder) {
      return <RecipeBuilder onClose={() => setShowRecipeBuilder(false)} />;
    }

    if (showScan) {
      return (
        <div>
          <button
            onClick={() => setShowScan(false)}
            className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 hover:text-emerald-700"
          >
            ← Back
          </button>
          <UploadInvoice />
        </div>
      );
    }

    if (showNutrientLog) {
      return <NutrientLog onClose={() => setShowNutrientLog(false)} />;
    }

    switch (activeTab) {
      case 'home': return <Home />;
      case 'meals': return <MealPlanner triggerLogMeal={triggerLogMeal} />;
      case 'grocery': return <GroceryInventory triggerAddItem={triggerAddItem} />;
      case 'history': return <History />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 animate-fade-in">
        {renderScreen()}
      </main>
      <BottomNav
        active={activeTab}
        onTabChange={(tab) => { setShowScan(false); setShowRecipeBuilder(false); setShowNutrientLog(false); setActiveTab(tab); }}
        onAction={handleAction}
      />
    </div>
  );
};

export default Index;
