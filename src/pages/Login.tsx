import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Loader2, Heart, ArrowRight } from 'lucide-react';
import { initDriveAuth, signIn, isDriveLinked } from '@/lib/driveAuth';

const Login = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initDriveAuth();
    if (isDriveLinked()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleDriveSignIn = async () => {
    try {
      setSyncing(true);
      setErrorMsg('');
      await initDriveAuth();
      await signIn();
      navigate('/', { replace: true });
    } catch (e: any) {
      setErrorMsg(e.message || 'Sign-in failed. Check your configuration.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('skip-login', '1');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-10 -left-10 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-10 w-40 h-40 bg-teal-200/40 rounded-full blur-3xl" />

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 z-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-100/80 rounded-2xl flex items-center justify-center shadow-inner mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-300 to-teal-200 opacity-20" />
          <Heart size={36} className="text-emerald-600 fill-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Meal Magic</h1>
        <p className="text-emerald-600/80 font-medium mb-8">Healthy Meal Planning</p>

        <div className="w-full space-y-4">
          <div>
            <button
              onClick={handleDriveSignIn}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-70 active:scale-95"
            >
              {syncing ? <Loader2 className="animate-spin" size={18} /> : <Cloud size={18} />}
              Continue with Google Drive
            </button>
            <p className="text-[10px] text-gray-400 mt-2">
              Automatically backup your recipes, meals, and inventory.
            </p>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">Or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-all active:scale-95"
          >
            Continue as Guest <ArrowRight size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-6 p-3 bg-red-50/80 border border-red-100 rounded-xl w-full">
            <p className="text-xs font-medium text-red-600">
              {errorMsg}
            </p>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400 z-10 font-medium">Safe, secure, and fully offline-capable.</p>
    </div>
  );
};

export default Login;
