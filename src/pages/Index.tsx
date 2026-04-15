import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading, isRecovery } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-background"><span className="text-muted-foreground">Cargando...</span></div>;
  if (isRecovery) return <Navigate to="/reset-password" replace />;
  return <Navigate to={user ? "/lobby" : "/login"} replace />;
};

export default Index;