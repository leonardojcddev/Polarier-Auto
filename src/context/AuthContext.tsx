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
  needsPasswordSetup: boolean;
  setNeedsPasswordSetup: (value: boolean) => void;
  login: (email: string, password: string) => Promise<{ user: User | null }>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const hasRecoveryParams = () => {
  const { search, hash } = window.location;
  return (
    search.includes('type=recovery') ||
    hash.includes('type=recovery') ||
    (hash.includes('access_token=') && hash.includes('refresh_token='))
  );
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(() => hasRecoveryParams());
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);

  const loadProfile = async () => {
    const p = await getProfile();
    setProfile(p);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const recoveryDetected = event === 'PASSWORD_RECOVERY' || hasRecoveryParams();

      if (recoveryDetected) {
        setIsRecovery(true);
      } else if (!session) {
        setIsRecovery(false);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user && !recoveryDetected) {
        setTimeout(() => loadProfile(), 0);
      } else if (!session?.user) {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const recoveryDetected = hasRecoveryParams();

      if (recoveryDetected) {
        setIsRecovery(true);
      } else if (!session) {
        setIsRecovery(false);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user && !recoveryDetected) {
        loadProfile();
      } else if (!session?.user) {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    return { user: result.user ?? null };
  };

  const register = async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    setNeedsPasswordSetup(false);
    await authSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isRecovery, needsPasswordSetup, setNeedsPasswordSetup, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};