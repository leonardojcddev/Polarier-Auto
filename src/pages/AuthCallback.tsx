import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";

/**
 * Callback web tras magic link. Supabase JS procesa la URL
 * automáticamente (detectSessionInUrl: true) usando flujo PKCE.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // PKCE flow: Supabase intercambia el código por sesión
    // Puede tomar un momento, esperamos un poco
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/lobby", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthCard>
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Completando autenticación...</p>
      </div>
    </AuthCard>
  );
};

export default AuthCallback;
