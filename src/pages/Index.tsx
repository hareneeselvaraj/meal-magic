import { useState, useCallback } from 'react';
import FloatingBackground from '@/components/FloatingBackground';
import BottomNav, { type TabId } from '@/components/BottomNav';
import Home from './Home';
import Recipes from './Recipes';
import MealPlanner from './MealPlanner';
import GroceryInventory from './GroceryInventory';
import RecipeForm from './RecipeForm';
import Profile from './Profile';
import OfflineBanner from '@/components/OfflineBanner';
import InstallPrompt from '@/components/InstallPrompt';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeVideoData, setRecipeVideoData] = useState<{ url: string; language: string; platform: string; extractedRecipe?: any } | undefined>(undefined);
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);



  const renderScreen = () => {
    if (showRecipeForm) {
      return <RecipeForm onClose={() => { setShowRecipeForm(false); setRecipeVideoData(undefined); }} videoData={recipeVideoData} />;
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
      case 'recipes': return <Recipes initialCuisineId={selectedCuisineId} onCuisineChange={setSelectedCuisineId} onOpenRecipeForm={(videoData) => { setRecipeVideoData(videoData); setShowRecipeForm(true); }} />;
      case 'planner': return <MealPlanner />;
      case 'grocery': return <GroceryInventory />;
      default: return <Home onOpenProfile={() => setShowProfile(true)} onNavigateToPlan={() => setActiveTab('planner')} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <OfflineBanner />
      <FloatingBackground />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 animate-fade-in">
        {renderScreen()}
      </main>
      <InstallPrompt />
      <BottomNav
        active={activeTab}
        onTabChange={(tab) => { setShowRecipeForm(false); setShowProfile(false); setActiveTab(tab); }}
      />
    </div>
  );
};

export default Index;
