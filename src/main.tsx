import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from '@/lib/supabaseClient';

/**
 * Deep link handler: cuando Android abre la app con polarier://auth/callback#...
 * procesamos los tokens y navegamos al destino correcto.
 */
CapacitorApp.addListener('appUrlOpen', async (event) => {
  const url = event.url;
  if (!url) return;

  try {
    const parsed = new URL(url);
    const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = parsed.searchParams;

    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const code = queryParams.get('code');

    // Magic link (flujo implícito): access_token + refresh_token en el hash
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
    // OAuth / PKCE: ?code=...
    else if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Siempre pasamos por /auth/callback para que la lógica de signin vs signup
    // decida el destino final (rechazar login sin registro, llevar a setup-password, etc.)
    window.location.href = '/auth/callback';
  } catch (err) {
    console.error('Error procesando deep link', err);
    window.location.href = '/login';
  }
});

createRoot(document.getElementById("root")!).render(<App />);
