import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

/**
 * Redirect URL tras verificar email o completar OAuth.
 * Debe estar registrada en Supabase → Authentication → URL Configuration → Redirect URLs.
 */
const getAuthRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) return 'polarier://auth/callback';
  return `${window.location.origin}/auth/callback`;
};

/**
 * "Intención" del flujo OAuth/email-link: signin o signup.
 * Supabase no expone shouldCreateUser en OAuth, así que guardamos la intención
 * antes de salir y la validamos en el callback. Clave efímera.
 */
const INTENT_KEY = 'polarier_auth_intent';
export type AuthIntent = 'signin' | 'signup';

export const setAuthIntent = (intent: AuthIntent) => {
  localStorage.setItem(INTENT_KEY, JSON.stringify({ intent, ts: Date.now() }));
};

export const consumeAuthIntent = (): AuthIntent | null => {
  const raw = localStorage.getItem(INTENT_KEY);
  if (!raw) return null;
  localStorage.removeItem(INTENT_KEY);
  try {
    const { intent, ts } = JSON.parse(raw);
    if (Date.now() - ts > 10 * 60 * 1000) return null; // 10 min max
    return intent;
  } catch {
    return null;
  }
};

/**
 * Registro con email: envía magic link de alta. No se pide contraseña aquí;
 * tras confirmar el email, el callback lleva a /setup-password.
 */
export const signUpWithEmail = async (email: string) => {
  setAuthIntent('signup');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
};

/**
 * Login con email+password. Falla si el usuario no existe o la contraseña no coincide.
 * Supabase devuelve "invalid credentials" en ambos casos — no se puede distinguir
 * sin enumerar usuarios (inseguro).
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/**
 * OAuth Google. La intención (signin/signup) se valida en el callback porque
 * Supabase no permite bloquear la creación de usuario desde OAuth.
 */
export const signInWithGoogle = async (intent: AuthIntent) => {
  setAuthIntent(intent);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
