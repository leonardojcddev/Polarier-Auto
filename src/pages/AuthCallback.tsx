import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { consumeAuthIntent } from "@/services/auth";

/**
 * Callback de autenticación (magic link signup + OAuth).
 *
 * Reglas:
 * - Signup-email (magic link de alta) → siempre lleva a /setup-password. Se detecta
 *   por provider=email + usuario recién creado. No depende de localStorage "intent"
 *   porque el link se puede abrir en otro navegador/dispositivo.
 * - Signin con Google de cuenta que se acaba de crear (porque Supabase no bloquea
 *   OAuth signup) → signOut y redirigir a /register. Aquí sí usamos intent porque
 *   el flujo OAuth vuelve al mismo navegador que lo inició.
 * - Resto → /lobby.
 *
 * authProcessing bloquea los guards de ruta mientras decidimos destino, para evitar
 * que ProtectedRoute muestre /lobby un instante antes.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { setNeedsPasswordSetup, setAuthProcessing } = useAuth();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setAuthProcessing(true);

    const run = async () => {
      // Dar tiempo a detectSessionInUrl para procesar la URL.
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setAuthProcessing(false);
        navigate("/login", { replace: true });
        return;
      }

      const user = session.user;
      const intent = consumeAuthIntent();
      const provider = user.app_metadata?.provider;

      const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
      const isBrandNew =
        createdAt > 0 && lastSignIn > 0 && Math.abs(lastSignIn - createdAt) < 10000;

      // 1) Login Google de cuenta que se acaba de crear → rechazar.
      if (intent === "signin" && provider === "google" && isBrandNew) {
        await supabase.auth.signOut();
        setError("Esta cuenta no existe todavía. Debes registrarte primero.");
        setTimeout(() => {
          setAuthProcessing(false);
          navigate("/register", { replace: true });
        }, 1500);
        return;
      }

      // 2) Alta por email (magic link): provider=email + recién creado → setup password.
      //    Detección independiente del intent porque el link puede abrirse en otro
      //    navegador donde el intent no existe.
      if (provider === "email" && isBrandNew) {
        setNeedsPasswordSetup(true);
        setAuthProcessing(false);
        navigate("/setup-password", { replace: true });
        return;
      }

      // 3) Resto: signup Google nuevo, signin Google existente, magic link de usuario
      //    existente (no debería ocurrir en nuestro flujo), etc. → lobby.
      setAuthProcessing(false);
      navigate("/lobby", { replace: true });
    };

    run();
  }, [navigate, setNeedsPasswordSetup, setAuthProcessing]);

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
