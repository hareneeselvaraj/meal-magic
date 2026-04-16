import { useState, useEffect } from 'react';
import { useNutriMom } from '@/context/NutriMomContext';
import type { ProfileType } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import { User, Heart, Baby, Edit2, Check, Shield, Languages, Scale, Ruler, Activity, Cloud, CloudOff, RefreshCw, Download, Upload, Loader2 } from 'lucide-react';
import { initDriveAuth, signIn, signOut, isDriveLinked, isDriveConfigured } from '@/lib/driveAuth';
import { backupToDrive, restoreFromDrive, getLastSyncTime } from '@/lib/driveSync';

const DEFICIENCY_OPTIONS = [
  { id: 'iron', label: 'Iron', emoji: '🩸', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900' },
  { id: 'vitamin_d', label: 'Vitamin D', emoji: '☀️', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  { id: 'ferritin', label: 'Ferritin', emoji: '🔬', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900' },
  { id: 'b12', label: 'Vitamin B12', emoji: '💊', color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900' },
  { id: 'calcium', label: 'Calcium', emoji: '🦴', color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900' },
  { id: 'folic_acid', label: 'Folic Acid', emoji: '🧬', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
];

const Profile = () => {
  const { activeProfile, setActiveProfile } = useNutriMom();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeProfile.displayName);
  const [editType, setEditType] = useState<ProfileType>(activeProfile.profileType);
  const [editWeight, setEditWeight] = useState(activeProfile.weight);
  const [editHeight, setEditHeight] = useState(activeProfile.height);
  const [editAge, setEditAge] = useState(activeProfile.age);
  const [editDeficiencies, setEditDeficiencies] = useState<string[]>(activeProfile.deficiencies);

  // Drive sync state
  const [driveLinked, setDriveLinked] = useState(isDriveLinked());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [driveMsg, setDriveMsg] = useState('');

  useEffect(() => {
    initDriveAuth();
    getLastSyncTime().then(setLastSync);
  }, []);

  const handleDriveSignIn = async () => {
    try {
      setSyncing(true);
      await initDriveAuth();
      await signIn();
      setDriveLinked(true);
      setDriveMsg('Linked to Google Drive!');
    } catch (e: any) {
      setDriveMsg(e.message || 'Sign-in failed');
    } finally { setSyncing(false); }
  };

  const handleBackup = async () => {
    try {
      setSyncing(true); setDriveMsg('');
      await backupToDrive();
      const t = await getLastSyncTime();
      setLastSync(t);
      setDriveMsg('Backup complete!');
    } catch (e: any) {
      setDriveMsg(e.message || 'Backup failed');
    } finally { setSyncing(false); }
  };

  const handleRestore = async () => {
    try {
      setSyncing(true); setDriveMsg('');
      const ok = await restoreFromDrive();
      if (ok) {
        setDriveMsg('Restored! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setDriveMsg('No backup found on Drive');
      }
    } catch (e: any) {
      setDriveMsg(e.message || 'Restore failed');
    } finally { setSyncing(false); }
  };

  const handleSave = () => {
    setActiveProfile({
      ...activeProfile,
      displayName: editName,
      profileType: editType,
      weight: editWeight,
      height: editHeight,
      age: editAge,
      deficiencies: editDeficiencies,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };

  const toggleDeficiency = (id: string) => {
    setEditDeficiencies(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const bmi = activeProfile.weight / ((activeProfile.height / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-amber-600' : bmi < 25 ? 'text-emerald-600' : bmi < 30 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User size={22} className="text-emerald-500" />
          Health Profile
        </h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
            isEditing
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-white/70 dark:bg-slate-800/70 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
          )}
        >
          {isEditing ? <><Check size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
        </button>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-900/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
            {activeProfile.profileType === 'pregnancy' ? '\uD83E\uDD30' : '\u2764\uFE0F'}
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="text-lg font-bold bg-white/60 rounded-lg px-2 py-1 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200">{activeProfile.displayName}</h2>
            )}
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{activeProfile.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Profile Type */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Shield size={14} className="text-emerald-500" /> Health Focus
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { type: 'pregnancy' as ProfileType, label: 'Pregnancy', icon: Baby, emoji: '\uD83E\uDD30', desc: 'Iron, calcium & folate focus' },
            { type: 'heart_health' as ProfileType, label: 'Heart Health', icon: Heart, emoji: '\u2764\uFE0F', desc: 'Low sodium, high fiber focus' },
          ]).map(opt => (
            <button
              key={opt.type}
              onClick={() => isEditing && setEditType(opt.type)}
              disabled={!isEditing}
              className={cn(
                "p-3.5 rounded-xl border-2 transition-all text-left",
                (isEditing ? editType : activeProfile.profileType) === opt.type
                  ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40"
                  : "border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50",
                !isEditing && "opacity-80"
              )}
            >
              <span className="text-2xl block mb-1">{opt.emoji}</span>
              <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200">{opt.label}</h4>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Body Stats */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Activity size={14} className="text-emerald-500" /> Body Stats
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 mx-auto mb-1.5 flex items-center justify-center">
              <Scale size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            {isEditing ? (
              <input type="number" value={editWeight} onChange={e => setEditWeight(+e.target.value)}
                className="w-full text-center text-sm font-bold bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg px-1 py-1 border border-gray-200 dark:border-slate-700" />
            ) : (
              <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{activeProfile.weight} kg</span>
            )}
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Weight</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 mx-auto mb-1.5 flex items-center justify-center">
              <Ruler size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            {isEditing ? (
              <input type="number" value={editHeight} onChange={e => setEditHeight(+e.target.value)}
                className="w-full text-center text-sm font-bold bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg px-1 py-1 border border-gray-200 dark:border-slate-700" />
            ) : (
              <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{activeProfile.height} cm</span>
            )}
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Height</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 mx-auto mb-1.5 flex items-center justify-center">
              <User size={16} className="text-sky-600 dark:text-sky-400" />
            </div>
            {isEditing ? (
              <input type="number" value={editAge} onChange={e => setEditAge(+e.target.value)}
                className="w-full text-center text-sm font-bold bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg px-1 py-1 border border-gray-200 dark:border-slate-700" />
            ) : (
              <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{activeProfile.age} yrs</span>
            )}
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Age</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-slate-400">BMI</span>
          <span className={cn("text-sm font-bold", bmiColor)}>
            {bmi.toFixed(1)} &mdash; {bmiLabel}
          </span>
        </div>
      </GlassCard>

      {/* Deficiencies */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Languages size={14} className="text-emerald-500" /> Nutritional Deficiencies
        </h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
          Select your known deficiencies &mdash; we'll recommend recipes rich in these nutrients.
        </p>
        <div className="flex flex-wrap gap-2">
          {DEFICIENCY_OPTIONS.map(def => {
            const isSelected = (isEditing ? editDeficiencies : activeProfile.deficiencies).includes(def.id);
            return (
              <button
                key={def.id}
                onClick={() => isEditing && toggleDeficiency(def.id)}
                disabled={!isEditing}
                className={cn(
                  "text-xs px-3 py-2 rounded-xl font-medium border transition-all flex items-center gap-1.5",
                  isSelected ? def.color : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700",
                  isEditing && "cursor-pointer hover:scale-105",
                  !isEditing && "cursor-default"
                )}
              >
                <span>{def.emoji}</span>
                {def.label}
                {isSelected && <Check size={12} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Languages size={14} className="text-emerald-500" /> Language
        </h3>
        <div className="flex gap-3">
          <button className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            activeProfile.preferredLanguage === 'en'
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400"
          )}>&#x1F1EC;&#x1F1E7; English</button>
          <button className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
            activeProfile.preferredLanguage === 'ta'
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400"
          )}>&#x1F1EE;&#x1F1F3; &#xBA4;&#xBAE;&#xBBF;&#xBB4;&#xBCD;</button>
        </div>
      </GlassCard>

      {/* Backup & Sync */}
      <GlassCard className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/40 dark:border-blue-900/40">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Cloud size={14} className="text-blue-500" /> Backup & Sync
        </h3>

        {!isDriveConfigured() ? (
          <div className="text-center py-3">
            <CloudOff size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Google Drive sync is not configured.</p>
            <p className="text-[10px] text-gray-400 mt-1">Set VITE_GOOGLE_CLIENT_ID in .env to enable.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", driveLinked ? "bg-emerald-500" : "bg-gray-300")} />
                <span className="text-xs font-medium text-gray-600">
                  {driveLinked ? 'Linked to Drive' : 'Not linked'}
                </span>
              </div>
              {lastSync && (
                <span className="text-[10px] text-gray-400">
                  Last: {new Date(lastSync).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Actions */}
            {!driveLinked ? (
              <button
                onClick={handleDriveSignIn}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
                Sign in with Google
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBackup}
                  disabled={syncing}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {syncing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  Back Up
                </button>
                <button
                  onClick={handleRestore}
                  disabled={syncing}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-blue-300 transition-colors disabled:opacity-50"
                >
                  {syncing ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  Restore
                </button>
              </div>
            )}

            {driveLinked && (
              <button
                onClick={() => { signOut(); setDriveLinked(false); setDriveMsg(''); }}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
              >
                Unlink Drive
              </button>
            )}

            {driveMsg && (
              <p className={cn("text-xs font-medium text-center", driveMsg.includes('fail') || driveMsg.includes('error') ? 'text-red-500' : 'text-emerald-600')}>
                {driveMsg}
              </p>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Profile;
