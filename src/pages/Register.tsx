import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { signUpEmail, signUpGoogle } = useAuth();
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
      await signUpEmail(email);
      setSent(true);
      toast.success("Enlace de verificación enviado.");
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("rate limit")) {
        toast.error("Demasiadas solicitudes. Espera unos minutos.");
      } else {
        toast.error(msg || "No se pudo enviar el enlace");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signUpGoogle();
    } catch (err: any) {
      toast.error(err.message || "Error con Google");
    }
  };

  if (sent) {
    return (
      <AuthCard>
        <div className="text-center space-y-4 py-4">
          <h2 className="text-lg font-semibold text-foreground">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground">
            Te hemos enviado un enlace de verificación a <span className="font-medium text-foreground">{email}</span>. Ábrelo para completar el registro y crear tu contraseña.
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
        Crea tu cuenta en Polarier
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
          {loading ? "Enviando..." : "Registrarme con correo"}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">o</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-2.5 border border-border rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors bg-card"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Registrarse con Google
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿Ya tienes cuenta?{" "}
          <button onClick={() => navigate("/login")} className="text-foreground font-medium hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </AuthCard>
  );
};

export default Register;
