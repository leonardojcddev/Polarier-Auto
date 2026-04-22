import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";

/**
 * Página a la que Supabase redirige tras verificar email o completar OAuth (solo en web).
 * En app nativa esto lo maneja el listener de appUrlOpen en main.tsx.
 *
 * La URL típicamente trae:
 *   /auth/callback#access_token=...&refresh_token=...&type=signup
 *   /auth/callback?code=...  (flujo PKCE)
 * Supabase JS detecta esto automáticamente (detectSessionInUrl: true), así que solo
 * esperamos a que procese y redirigimos según el tipo.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get("type") || new URLSearchParams(window.location.search).get("type");

    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (type === "recovery") {
        navigate("/reset-password", { replace: true });
      } else if (session) {
        navigate("/lobby", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 400);

    return () => clearTimeout(timeout);
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
