import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Lobby from "./pages/Lobby";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import History from "./pages/History";
import SettingsPage from "./pages/SettingsPage";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <span className="text-muted-foreground">Cargando...</span>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, authProcessing, isRecovery } = useAuth();
  const location = useLocation();
  if (loading || authProcessing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (isRecovery && location.pathname !== "/reset-password")
    return <Navigate to="/reset-password" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, authProcessing, isRecovery } = useAuth();
  if (loading || authProcessing) return <LoadingScreen />;
  if (isRecovery) return <Navigate to="/reset-password" replace />;
  if (user) return <Navigate to="/lobby" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<Chat />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-email" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
