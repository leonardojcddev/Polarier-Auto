import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/lobby");
    } catch (err: any) {
      const msg: string = (err.message || "").toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        toast.error("Correo o contraseña incorrectos. Si no tienes cuenta, regístrate primero.");
      } else if (msg.includes("email not confirmed")) {
        toast.error("Debes verificar tu correo electrónico antes de iniciar sesión.");
      } else {
        toast.error(err.message || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

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
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

        <div className="text-right">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-secondary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {loading ? "Iniciando..." : "Iniciar sesión"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿No tienes cuenta?{" "}
          <button onClick={() => navigate("/register")} className="text-foreground font-medium hover:underline">
            Regístrate
          </button>
        </p>
      </div>
    </AuthCard>
  );
};

export default Login;
