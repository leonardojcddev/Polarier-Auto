import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

/**
 * URL de redirect tras verificar email o recuperar contraseña.
 * Debe estar registrada en Supabase → Authentication → URL Configuration → Redirect URLs.
 */
const getAuthRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) return 'polarier://auth/callback';
  return `${window.location.origin}/auth/callback`;
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: fullName ? { full_name: fullName } : undefined,
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

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });
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
