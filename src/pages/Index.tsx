import { useState } from 'react';
import FloatingBackground from '@/components/FloatingBackground';
import BottomNav, { type TabId, type ActionId } from '@/components/BottomNav';
import Home from './Home';
import Recipes from './Recipes';
import MealPlanner from './MealPlanner';
import GroceryInventory from './GroceryInventory';
import RecipeForm from './RecipeForm';
import SettingsDrawer from '@/components/SettingsDrawer';
import OfflineBanner from '@/components/OfflineBanner';
import InstallPrompt from '@/components/InstallPrompt';
import FridgeScanner from '@/components/FridgeScanner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showScanner, setShowScanner] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeVideoData, setRecipeVideoData] = useState<{ url: string; language: string; platform: string; extractedRecipe?: any } | undefined>(undefined);
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [openGroceryAdd, setOpenGroceryAdd] = useState(false);
  const [initialScanFile, setInitialScanFile] = useState<File | null>(null);


  const renderScreen = () => {
    if (showRecipeForm) {
      return <RecipeForm onClose={() => { setShowRecipeForm(false); setRecipeVideoData(undefined); }} videoData={recipeVideoData} />;
    }
    switch (activeTab) {
      case 'home': return <Home onOpenProfile={() => setShowSettings(true)} onNavigateToPlan={() => setActiveTab('planner')} />;
      case 'recipes': return <Recipes initialCuisineId={selectedCuisineId} onCuisineChange={setSelectedCuisineId} onOpenRecipeForm={(videoData) => { setRecipeVideoData(videoData); setShowRecipeForm(true); }} />;
      case 'planner': return <MealPlanner />;
      case 'grocery': return <GroceryInventory openAddModal={openGroceryAdd} onCloseAddModal={() => setOpenGroceryAdd(false)} initialScanFile={initialScanFile} onScanFileConsumed={() => setInitialScanFile(null)} />;
      default: return <Home onOpenProfile={() => setShowSettings(true)} onNavigateToPlan={() => setActiveTab('planner')} />;
    }
  };

  const handleActionSelect = (action: ActionId) => {
    // Reset all overlays first
    setShowScanner(false);
    setShowRecipeForm(false);
    
    if (action === 'recipe') {
      setRecipeVideoData(undefined);
      setShowRecipeForm(true);
    } else if (action === 'grocery') {
      setActiveTab('grocery');
      setOpenGroceryAdd(true);
    } else if (action === 'bill') {
      document.getElementById('global-bill-scanner')?.click();
    } else if (action === 'camera') {
      setShowScanner(true);
    }
  };

  const handleGlobalBillScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInitialScanFile(file);
      setActiveTab('grocery');
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen relative">
      <input type="file" id="global-bill-scanner" accept="image/*,application/pdf" className="hidden" onChange={handleGlobalBillScan} />
      <OfflineBanner />
      <FloatingBackground />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 animate-fade-in">
        {renderScreen()}
      </main>
      <InstallPrompt />
      <SettingsDrawer isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showScanner && (
        <FridgeScanner 
          onClose={() => setShowScanner(false)} 
          onRecipeCreated={() => { 
            setActiveTab('recipes'); 
          }} 
        />
      )}

      <BottomNav
        active={activeTab}
        onTabChange={(tab) => { setShowRecipeForm(false); setShowSettings(false); setActiveTab(tab); }}
        onActionSelect={handleActionSelect}
      />
    </div>
  );
};

export default Index;
