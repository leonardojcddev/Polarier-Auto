import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!accepted) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      navigate("/verify-email");
    } catch (err: any) {
      toast.error(err.message || "Error al crear cuenta");
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

  return (
    <AuthCard>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Crea tu cuenta en Polarier
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Contraseña</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
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
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
          />
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" className="mt-1 accent-secondary" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span className="text-sm text-muted-foreground">
            Acepto los términos y condiciones y la política de privacidad
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta"}
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
