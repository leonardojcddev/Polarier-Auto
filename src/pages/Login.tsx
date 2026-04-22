import { useState } from "react";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { sendLink } = useAuth();
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
      await sendLink(email);
      setSent(true);
      toast.success("Enlace enviado. Revisa tu correo.");
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("rate limit")) {
        toast.error("Has solicitado demasiados enlaces. Espera unos minutos.");
      } else {
        toast.error(msg || "No se pudo enviar el enlace");
      }
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
            Te hemos enviado un enlace a <span className="font-medium text-foreground">{email}</span>. Ábrelo para iniciar sesión.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-sm text-secondary hover:underline"
          >
            Usar otro correo
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Gestiona y procesa tus documentos con inteligencia artificial
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
          {loading ? "Enviando..." : "Enviar enlace de acceso"}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Al continuar aceptas los términos y la política de privacidad.
        </p>
      </div>
    </AuthCard>
  );
};

export default Login;
