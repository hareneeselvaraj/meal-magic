import { useState, useEffect } from 'react';
import { useMealPlanner } from '@/context/MealPlannerContext';
import type { ProfileType, Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  X, User, Heart, Baby, Shield, Languages, Cloud, CloudOff,
  Upload, Download, Loader2, Check, Moon, Sun, Monitor, Trash2, Settings, Smartphone
} from 'lucide-react';
import { initDriveAuth, signIn, signOut, isDriveLinked, isDriveConfigured } from '@/lib/driveAuth';
import { backupToDrive, restoreFromDrive, getLastSyncTime } from '@/lib/driveSync';

const DEFICIENCY_OPTIONS = [
  { id: 'iron', label: 'Iron', emoji: '🩸' },
  { id: 'vitamin_d', label: 'Vitamin D', emoji: '☀️' },
  { id: 'calcium', label: 'Calcium', emoji: '🦴' },
  { id: 'folic_acid', label: 'Folate', emoji: '🧬' },
  { id: 'fiber', label: 'Fiber', emoji: '🥗' },
];

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild', emoji: '🌶️' },
  { id: 'medium', label: 'Medium', emoji: '🌶️🌶️' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️🌶️🌶️' },
];

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { activeProfile, setActiveProfile, cuisines } = useMealPlanner();

  // Drive sync state
  const [driveLinked, setDriveLinked] = useState(isDriveLinked());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [driveMsg, setDriveMsg] = useState('');

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    initDriveAuth();
    getLastSyncTime().then(setLastSync);
    
    // Check initial theme class
    if (localStorage.getItem('theme') === 'light') setTheme('light');
    else if (localStorage.getItem('theme') === 'dark') setTheme('dark');
    else setTheme('system');
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const updateProfile = (patch: Partial<typeof activeProfile>) => {
    setActiveProfile({ ...activeProfile, ...patch, updatedAt: new Date() });
  };

  const toggleDeficiency = (id: string) => {
    const current = activeProfile.deficiencies || [];
    updateProfile({
      deficiencies: current.includes(id) ? current.filter(d => d !== id) : [...current, id]
    });
  };

  const toggleCuisine = (id: string) => {
    const current = activeProfile.preferredCuisines || [];
    updateProfile({
      preferredCuisines: current.includes(id) ? current.filter(c => c !== id) : [...current, id]
    });
  };

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDriveSignIn = async () => {
    try {
      setSyncing(true); setDriveMsg('');
      await signIn();
      setDriveLinked(true);
      setDriveMsg('Linked to Google Drive!');
    } catch (e: any) { setDriveMsg(e.message || 'Sign-in failed'); } finally { setSyncing(false); }
  };

  const handleBackup = async () => {
    try {
      setSyncing(true); setDriveMsg('');
      await backupToDrive();
      const t = await getLastSyncTime();
      setLastSync(t);
      setDriveMsg('Backup complete!');
    } catch (e: any) { setDriveMsg(e.message || 'Backup failed'); } finally { setSyncing(false); }
  };

  const handleRestore = async () => {
    try {
      setSyncing(true); setDriveMsg('');
      const ok = await restoreFromDrive();
      if (ok) {
        setDriveMsg('Restored! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else { setDriveMsg('No backup found'); }
    } catch (e: any) { setDriveMsg('Restore failed'); } finally { setSyncing(false); }
  };

  return (
    <>
      <div 
        className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} 
        onClick={onClose} 
      />
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 transform overflow-hidden flex flex-col mx-auto max-w-lg",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drawer Handle */}
        <div className="pt-3 pb-2 flex justify-center w-full shrink-0" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <Settings size={22} className="text-emerald-500" /> Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto">
          
          {/* Profile Basic */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 text-white font-bold">
               {activeProfile.displayName ? activeProfile.displayName[0] : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">{activeProfile.displayName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-medium">Focus:</span>
                <select 
                  value={activeProfile.profileType} 
                  onChange={e => updateProfile({ profileType: e.target.value as ProfileType })}
                  className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg px-2 py-1 border-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pregnancy">Pregnancy</option>
                  <option value="heart_health">Heart Health</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nutritional Needs */}
          <div>
            <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" /> My Nutritional Needs
            </h4>
            <div className="flex flex-wrap gap-2">
              {DEFICIENCY_OPTIONS.map(def => {
                const isSelected = (activeProfile.deficiencies || []).includes(def.id);
                return (
                  <button
                    key={def.id}
                    onClick={() => toggleDeficiency(def.id)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-xl font-medium border flex items-center gap-1.5 transition-colors",
                      isSelected ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-400" : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                    )}
                  >
                    <span>{def.emoji}</span> {def.label}
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 italic">These update AI meal suggestions automatically.</p>
          </div>

          {/* Meal Preferences */}
          <div>
            <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" /> Meal Preferences
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-2">Cuisines I cook:</span>
                <div className="flex flex-wrap gap-2">
                  {cuisines.filter(c => c.isActive).map(c => {
                    const isSelected = (activeProfile.preferredCuisines || []).includes(c.id);
                    return (
                      <button key={c.id} onClick={() => toggleCuisine(c.id)} className={cn("text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors flex items-center gap-1", isSelected ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/50 dark:border-rose-800 dark:text-rose-400" : "bg-white border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400")}>
                        {isSelected && <Check size={12} />} {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Spice level</span>
                <select 
                  value={activeProfile.spiceLevel || 'medium'}
                  onChange={e => updateProfile({ spiceLevel: e.target.value as any })}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-xs font-medium rounded-lg px-2 py-1.5"
                >
                  {SPICE_LEVELS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Vegetarian filter</span>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">Hide meat recipes globally</p>
                </div>
                <div 
                  className={cn("w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors", activeProfile.isVegetarian ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600")}
                  onClick={() => updateProfile({ isVegetarian: !activeProfile.isVegetarian })}
                >
                  <div className={cn("bg-white w-4 h-4 rounded-full shadow-md transform transition-transform", activeProfile.isVegetarian ? "translate-x-4" : "translate-x-0")} />
                </div>
              </div>
            </div>
          </div>

          {/* Language & Theme */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <Languages size={14} className="text-blue-500" /> Language
                </h4>
                <select 
                  value={activeProfile.preferredLanguage}
                  onChange={e => updateProfile({ preferredLanguage: e.target.value as Language })}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium rounded-xl p-2.5 outline-none focus:border-blue-400"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="ta">🇮🇳 தமிழ்</option>
                </select>
             </div>
             
             <div className="space-y-2">
                <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-500" /> Theme
                </h4>
                <div className="flex bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1">
                  {(['light', 'system', 'dark'] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => applyTheme(t)}
                      className={cn("flex-1 py-1.5 rounded-lg flex justify-center text-gray-500 dark:text-slate-400 transition-colors", theme === t ? "bg-white shadow-sm dark:bg-slate-700 text-gray-800 dark:text-white" : "")}
                    >
                      {t === 'light' ? <Sun size={14} /> : t === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Backup */}
          <div>
            <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Cloud size={14} className="text-blue-500" /> Backup Sync
            </h4>
            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-3 rounded-xl">
               {!isDriveConfigured() ? (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">Google Drive sync is not configured (.env missing).</p>
                </div>
               ) : !driveLinked ? (
                  <button onClick={handleDriveSignIn} disabled={syncing} className="w-full flex justify-center items-center gap-2 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-semibold border border-gray-200 dark:border-slate-700">
                    {syncing ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />} Link Google Drive
                  </button>
               ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-600">✓ Connected</span>
                      <span className="text-gray-400">{lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never synced'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleBackup} disabled={syncing} className="flex justify-center items-center gap-1 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold">
                        {syncing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Backup Now
                      </button>
                      <button onClick={handleRestore} disabled={syncing} className="flex justify-center items-center gap-1 py-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold">
                        {syncing ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Restore
                      </button>
                    </div>
                    {driveMsg && <p className="text-[10px] text-center text-gray-500">{driveMsg}</p>}
                  </div>
               )}
            </div>
          </div>

          {/* App Info */}
          <div>
            <h4 className="text-xs font-extrabold tracking-wider text-gray-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Smartphone size={14} className="text-gray-400" /> App Info
            </h4>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-gray-500 font-medium">Version 1.0</span>
              <button 
                onClick={handleClearData}
                className="text-xs text-red-500 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={12} /> Clear all data
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
