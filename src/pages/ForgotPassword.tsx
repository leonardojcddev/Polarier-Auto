import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Introduce tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "No se pudo enviar el enlace");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard>
        <div className="text-center space-y-4 py-4">
          <h2 className="text-lg font-semibold text-foreground">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con <span className="font-medium text-foreground">{email}</span>,
            te hemos enviado un enlace para restablecer la contraseña.
          </p>
          <button onClick={() => navigate("/login")} className="text-sm text-secondary hover:underline">
            Volver al inicio de sesión
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <button onClick={() => navigate("/login")} className="text-foreground font-medium hover:underline">
            Volver
          </button>
        </p>
      </div>
    </AuthCard>
  );
};

export default ForgotPassword;
