import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, logout, setIsRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      toast.error("Introduce una contraseña");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Contraseña actualizada. Inicia sesión.");
      setIsRecovery(false);
      await logout();
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Nueva contraseña</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Introduce tu nueva contraseña para continuar.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Confirmar contraseña</label>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
          />
        </div>

        <button
          onClick={handleSubmit}
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
