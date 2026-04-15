import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { isRecovery: authRecovery, session } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(() => window.location.hash.includes("type=recovery"));
  const [checking, setChecking] = useState(true);

  const canResetPassword =
    authRecovery ||
    isRecovery ||
    (window.location.pathname === "/reset-password" && Boolean(session));

  useEffect(() => {
    if (canResetPassword) {
      setChecking(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setChecking(false);
      }
    });

    if (window.location.hash.includes("type=recovery")) {
      setIsRecovery(true);
      setChecking(false);
    }

    const timeout = setTimeout(() => setChecking(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [canResetPassword]);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error("Completa ambos campos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Contraseña actualizada. Inicia sesión con tu nueva contraseña.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthCard>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Verificando enlace...</p>
        </div>
      </AuthCard>
    );
  }

  if (!canResetPassword) {
    return (
      <AuthCard>
        <div className="text-center space-y-4">
          <p className="text-sm text-foreground font-medium">Enlace inválido o expirado</p>
          <p className="text-xs text-muted-foreground">
            Solicita un nuevo enlace de recuperación desde la página de inicio de sesión.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Ingresa tu nueva contraseña
      </p>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card pr-10"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </div>
    </AuthCard>
  );
};

export default ResetPassword;