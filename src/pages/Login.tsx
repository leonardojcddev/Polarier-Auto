import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { sendLink, loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [usePassword, setUsePassword] = useState(false);

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

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      toast.error(err.message || "Error con Google");
    }
  };

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      toast.error("Introduce correo y contraseña");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/lobby");
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        toast.error("Correo o contraseña incorrectos. Puede que esta cuenta use Google. Inicia con Google o crea contraseña.");
      } else {
        toast.error(msg || "No se pudo iniciar sesión");
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
        {usePassword ? (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
              />
            </div>

            <button
              onClick={handlePasswordLogin}
              disabled={loading}
              className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <button
              onClick={() => { setUsePassword(false); setPassword(""); }}
              className="w-full text-sm text-secondary hover:underline"
            >
              Usar enlace de acceso
            </button>
          </>
        ) : (
          <>
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
              Continuar con Google
            </button>

            <button
              onClick={() => setUsePassword(true)}
              className="w-full text-sm text-secondary hover:underline"
            >
              Iniciar con contraseña
            </button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          Al continuar aceptas los términos y la política de privacidad.
        </p>
      </div>
    </AuthCard>
  );
};

export default Login;
