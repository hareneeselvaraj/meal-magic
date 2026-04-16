import { useState, useCallback } from 'react';
import FloatingBackground from '@/components/FloatingBackground';
import BottomNav, { type TabId } from '@/components/BottomNav';
import Home from './Home';
import Recipes from './Recipes';
import MealPlanner from './MealPlanner';
import GroceryInventory from './GroceryInventory';
import UploadInvoice from './UploadInvoice';
import RecipeForm from './RecipeForm';
import Profile from './Profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeVideoData, setRecipeVideoData] = useState<{ url: string; language: string; platform: string; extractedRecipe?: any } | undefined>(undefined);
  const [showScan, setShowScan] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Trigger for grocery add-item dialog
  const [triggerAddItem, setTriggerAddItem] = useState(0);

  const handleAction = useCallback((action: string) => {
    setShowRecipeForm(false);
    setShowScan(false);
    setShowProfile(false);
    switch (action) {
      case 'New Recipe':
        setShowRecipeForm(true);
        break;
      case 'Scan':
        setShowScan(true);
        break;
      case 'Grocery':
        setActiveTab('grocery');
        setTriggerAddItem(n => n + 1);
        break;
    }
  }, []);

  const renderScreen = () => {
    if (showRecipeForm) {
      return <RecipeForm onClose={() => { setShowRecipeForm(false); setRecipeVideoData(undefined); }} videoData={recipeVideoData} />;
    }
    if (showScan) {
      return (
        <div>
          <button
            onClick={() => setShowScan(false)}
            className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 hover:text-emerald-700"
          >← Back</button>
          <UploadInvoice />
        </div>
      );
    }
    if (showProfile) {
      return (
        <div>
          <button
            onClick={() => setShowProfile(false)}
            className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 hover:text-emerald-700"
          >← Back to Home</button>
          <Profile />
        </div>
      );
    }

    switch (activeTab) {
      case 'home': return <Home onOpenProfile={() => setShowProfile(true)} onNavigateToPlan={() => setActiveTab('planner')} />;
      case 'recipes': return <Recipes onOpenRecipeForm={(videoData) => { setRecipeVideoData(videoData); setShowRecipeForm(true); }} />;
      case 'planner': return <MealPlanner />;
      case 'grocery': return <GroceryInventory triggerAddItem={triggerAddItem} />;
      default: return <Home onOpenProfile={() => setShowProfile(true)} onNavigateToPlan={() => setActiveTab('planner')} />;
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
        onTabChange={(tab) => { setShowRecipeForm(false); setShowScan(false); setShowProfile(false); setActiveTab(tab); }}
        onAction={handleAction}
      />
    </div>
  );
};

export default Index;
