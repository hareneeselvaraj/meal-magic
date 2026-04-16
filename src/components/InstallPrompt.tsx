import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install-dismissed");
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] max-w-md mx-auto p-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
        <Download className="text-white" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">Install Meal Magic</p>
        <p className="text-[11px] text-gray-500">Add to home screen for offline use</p>
      </div>
      <button
        onClick={async () => { await deferred.prompt(); setVisible(false); }}
        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors flex-shrink-0"
      >Install</button>
      <button
        onClick={() => { localStorage.setItem("install-dismissed", "1"); setVisible(false); }}
        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
      ><X size={14} className="text-gray-500" /></button>
    </div>
  );
}
