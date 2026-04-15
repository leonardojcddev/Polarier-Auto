import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://automate-cuba24.app.n8n.cloud/webhook/8416237b-faa5-4651-8df1-f24b3f35cc64",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      if (!res.ok) throw new Error("Error al enviar la solicitud");
      setSent(true);
      toast.success("Si el correo existe, te hemos enviado un enlace para restablecer tu contraseña.");
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la solicitud de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
      </p>

      {sent ? (
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-2xl">✉️</span>
          </div>
          <p className="text-sm text-foreground font-medium">
            Si el correo existe, hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      ) : (
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
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
