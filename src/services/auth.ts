import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

/**
 * URL a la que Supabase redirige después de verificar el correo o completar OAuth.
 * - En web: usamos el origin (https://polarier-auto-production.up.railway.app/auth/callback).
 * - En la app nativa: usamos el deep link scheme (polarier://auth/callback).
 * Esta URL debe estar registrada en Supabase → Authentication → URL Configuration → Redirect URLs.
 */
const getAuthRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return 'polarier://auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const resendVerification = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
};
