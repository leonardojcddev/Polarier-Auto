import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut as authSignOut } from '@/services/auth';
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
  isRecovery: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null }>;
  register: (email: string, password: string) => Promise<{ needsEmailVerification: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const hasRecoveryParams = () => {
  const { search, hash } = window.location;
  return search.includes('type=recovery') || hash.includes('type=recovery');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(() => hasRecoveryParams());

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      const recoveryDetected = event === 'PASSWORD_RECOVERY' || hasRecoveryParams();

      if (recoveryDetected) {
        setIsRecovery(true);
      } else if (!newSession) {
        setIsRecovery(false);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (newSession?.user && !recoveryDetected) {
        setTimeout(loadProfile, 0);
      } else if (!newSession?.user) {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      const recoveryDetected = hasRecoveryParams();

      if (recoveryDetected) setIsRecovery(true);
      else if (!initialSession) setIsRecovery(false);

      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      if (initialSession?.user && !recoveryDetected) loadProfile();
      else if (!initialSession?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    return { user: result.user ?? null };
  };

  const register = async (email: string, password: string) => {
    const result = await signUpWithEmail(email, password);
    // Si Supabase tiene "confirm email" activado, devuelve user sin session.
    // Si está desactivado, devuelve session inmediatamente.
    const needsEmailVerification = !result.session;
    return { needsEmailVerification };
  };

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isRecovery, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
