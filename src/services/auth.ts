import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

const getAuthRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return 'polarier://auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
};

/**
 * Envía un magic link al correo. Sirve tanto para registro como para login:
 * si el usuario no existe, Supabase lo crea; si existe, simplemente lo autentica.
 */
export const sendMagicLink = async (email: string, fullName?: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: true,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) throw error;
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

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};
