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

    // Capturamos la URL ANTES de que Supabase limpie el hash (detectSessionInUrl lo borra).
    const originalHref = window.location.href;
    const originalHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(originalHash);
    const queryParams = new URLSearchParams(window.location.search);
    const urlType = hashParams.get("type") || queryParams.get("type");
    const urlError = hashParams.get("error") || queryParams.get("error");
    const urlErrorDescription =
      hashParams.get("error_description") || queryParams.get("error_description");

    console.log("[AuthCallback] URL:", originalHref, "type:", urlType);

    const run = async () => {
      // Error devuelto por Supabase en la URL (enlace expirado, ya usado, etc.)
      if (urlError) {
        setError(decodeURIComponent(urlErrorDescription || urlError).replace(/\+/g, " "));
        setTimeout(() => {
          setAuthProcessing(false);
          navigate("/login", { replace: true });
        }, 2500);
        return;
      }

      // Dar tiempo a detectSessionInUrl para procesar la URL.
      await new Promise((r) => setTimeout(r, 600));

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
        createdAt > 0 && lastSignIn > 0 && Math.abs(lastSignIn - createdAt) < 15000;

      // 1) Google login de cuenta recién creada → rechazar.
      if (intent === "signin" && provider === "google" && isBrandNew) {
        await supabase.auth.signOut();
        setError("Esta cuenta no existe todavía. Debes registrarte primero.");
        setTimeout(() => {
          setAuthProcessing(false);
          navigate("/register", { replace: true });
        }, 1500);
        return;
      }

      // 2) Signup por email → /setup-password.
      //    Señal fuerte: la URL original trae type=signup (emitido por Supabase).
      //    Señal secundaria: provider=email + usuario brand-new.
      const isSignupConfirmation =
        urlType === "signup" ||
        urlType === "magiclink" ||
        (provider === "email" && isBrandNew);

      if (isSignupConfirmation && provider === "email") {
        setNeedsPasswordSetup(true);
        setAuthProcessing(false);
        navigate("/setup-password", { replace: true });
        return;
      }

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
