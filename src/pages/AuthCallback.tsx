import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { consumeAuthIntent } from "@/services/auth";

/**
 * Callback de autenticación (magic link signup + OAuth).
 *
 * Regla de negocio: login NO debe crear cuentas nuevas.
 * Supabase no permite bloquear la creación en OAuth, así que aquí detectamos
 * si la sesión recién creada es un usuario que acaba de aparecer y la intención
 * original era "signin" → cerramos sesión y mandamos a registro.
 *
 * Heurística "usuario recién creado": created_at y last_sign_in_at casi iguales
 * (diferencia < 5s). Es la forma fiable sin backend propio.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { setNeedsPasswordSetup } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      // Pequeño delay para que detectSessionInUrl de Supabase termine de procesar.
      await new Promise((r) => setTimeout(r, 400));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login", { replace: true });
        return;
      }

      const user = session.user;
      const intent = consumeAuthIntent();
      const provider = user.app_metadata?.provider;

      const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
      const isBrandNew = createdAt > 0 && lastSignIn > 0 && Math.abs(lastSignIn - createdAt) < 5000;

      // Caso 1: intentó login (signin) pero la cuenta se acaba de crear → rechazar.
      if (intent === "signin" && isBrandNew) {
        await supabase.auth.signOut();
        setError("Esta cuenta no existe todavía. Debes registrarte primero.");
        setTimeout(() => navigate("/register", { replace: true }), 1500);
        return;
      }

      // Caso 2: registro con email (magic link de alta) → pedir contraseña.
      // Sólo si la cuenta es nueva y no tiene contraseña establecida.
      // Nota: user.identities incluye provider 'email' cuando ya hay password set;
      // si no hay, forzamos setup. Como fallback seguro: intent === 'signup' && provider === 'email'.
      if (intent === "signup" && provider === "email") {
        setNeedsPasswordSetup(true);
        navigate("/setup-password", { replace: true });
        return;
      }

      // Caso 3: signup con Google → lobby directo (la cuenta queda creada y lista).
      // Caso 4: signin con Google de cuenta existente → lobby.
      // Caso 5: signin con email+password no pasa por aquí.
      navigate("/lobby", { replace: true });
    };

    run();
  }, [navigate, setNeedsPasswordSetup]);

  return (
    <AuthCard>
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Completando autenticación...</p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </AuthCard>
  );
};

export default AuthCallback;
