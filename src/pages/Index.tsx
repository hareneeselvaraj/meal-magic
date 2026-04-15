import { useState } from 'react';
import FloatingBackground from '@/components/FloatingBackground';
import BottomNav, { type TabId } from '@/components/BottomNav';
import Home from './Home';
import MealPlanner from './MealPlanner';
import GroceryInventory from './GroceryInventory';
import UploadInvoice from './UploadInvoice';
import History from './History';

const screens: Record<TabId, React.ComponentType> = {
  home: Home,
  meals: MealPlanner,
  grocery: GroceryInventory,
  upload: UploadInvoice,
  history: History,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const Screen = screens[activeTab];

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 animate-fade-in">
        <Screen />
      </main>
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
