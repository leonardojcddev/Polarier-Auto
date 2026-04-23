import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
} from '@/services/auth';
import { getProfile } from '@/services/chat';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authProcessing: boolean;
  setAuthProcessing: (v: boolean) => void;
  needsPasswordSetup: boolean;
  setNeedsPasswordSetup: (value: boolean) => void;
  login: (email: string, password: string) => Promise<{ user: User | null }>;
  signUpEmail: (email: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signUpGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  // Activo mientras /auth/callback decide destino. Bloquea guards para evitar
  // redirecciones prematuras (p. ej. a /lobby) antes de aplicar reglas de negocio.
  const [authProcessing, setAuthProcessing] = useState(
    typeof window !== 'undefined' && window.location.pathname === '/auth/callback'
  );

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      if (newSession?.user) setTimeout(loadProfile, 0);
      else setProfile(null);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      if (initialSession?.user) loadProfile();
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    return { user: result.user ?? null };
  };

  const signUpEmail = async (email: string) => {
    await signUpWithEmail(email);
  };

  const signInGoogle = async () => {
    await authSignInWithGoogle('signin');
  };

  const signUpGoogle = async () => {
    await authSignInWithGoogle('signup');
  };

  const logout = async () => {
    setNeedsPasswordSetup(false);
    await authSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        authProcessing,
        setAuthProcessing,
        needsPasswordSetup,
        setNeedsPasswordSetup,
        login,
        signUpEmail,
        signInGoogle,
        signUpGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
