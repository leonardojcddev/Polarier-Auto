import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { Mail } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
          <Mail size={32} className="text-secondary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Verifica tu correo electrónico
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Te hemos enviado un correo de verificación. Activa tu cuenta antes de iniciar sesión.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          Ir a iniciar sesión
        </button>
      </div>
    </AuthCard>
  );
};

export default VerifyEmail;
