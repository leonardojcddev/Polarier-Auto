import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setNeedsPasswordSetup } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const isGoogleUser = session.user.app_metadata?.provider === 'google';
          if (isGoogleUser) {
            setNeedsPasswordSetup(true);
            navigate("/setup-password", { replace: true });
          } else {
            navigate("/lobby", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, setNeedsPasswordSetup]);

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