import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (online) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-amber-500 text-white text-xs font-semibold py-1.5 text-center flex items-center justify-center gap-1.5 shadow-md">
      <WifiOff size={12} /> You're offline &mdash; changes are saved locally
    </div>
  );
}
