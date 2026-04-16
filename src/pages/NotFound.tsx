import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 text-5xl">
          🍽️
        </div>
        <h1 className="mb-2 text-6xl font-black text-emerald-800 tracking-tight">404</h1>
        <p className="mb-8 text-lg font-medium text-emerald-600/80">Oops! Looks like this plate is empty.</p>
        <a 
          href="/" 
          className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-500 px-8 text-sm font-bold text-white shadow transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-950 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
