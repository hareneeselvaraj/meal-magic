import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import { MealPlannerProvider } from "@/context/MealPlannerContext";
import { GroceryProvider } from "@/context/GroceryContext";
import { isDriveLinked } from "@/lib/driveAuth";

const queryClient = new QueryClient();

// Guardian route that redirects to /login if user hasn't skipped or linked drive
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isLinked = isDriveLinked();
  const hasSkipped = localStorage.getItem('skip-login') === '1';

  if (!isLinked && !hasSkipped) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <MealPlannerProvider>
          <GroceryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AuthRoute><Index /></AuthRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GroceryProvider>
        </MealPlannerProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
