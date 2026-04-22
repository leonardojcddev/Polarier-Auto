import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from '@/lib/supabaseClient';

CapacitorApp.addListener('appUrlOpen', async (event) => {
  // event.url típicamente tiene el formato:
  //   polarier://verify-email#access_token=...&refresh_token=...&type=signup
  //   polarier://verify-email?code=... (flujo PKCE OAuth)
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

    // Flujo implícito: access_token + refresh_token en el hash
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
    // Flujo PKCE (OAuth): ?code=...
    else if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  } catch (err) {
    console.error('Error procesando deep link', err);
  }

  // Ruta interna destino
  const routePath = url.includes('verify-email') ? '/verify-email' : '/lobby';
  window.location.href = routePath;
});

createRoot(document.getElementById("root")!).render(<App />);
