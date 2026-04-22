import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { Mail } from "lucide-react";
import { resendVerification } from "@/services/auth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("No conocemos tu correo. Regístrate de nuevo.");
      return;
    }
    setResending(true);
    try {
      await resendVerification(email);
      toast.success("Correo reenviado. Revisa tu bandeja.");
    } catch (err: any) {
      toast.error(err.message || "No se pudo reenviar el correo");
    } finally {
      setResending(false);
    }
  };

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
          {email ? (
            <>Te enviamos un correo de verificación a <strong className="text-foreground">{email}</strong>. Haz clic en el enlace para activar tu cuenta.</>
          ) : (
            <>Te hemos enviado un correo de verificación. Activa tu cuenta antes de iniciar sesión.</>
          )}
        </p>
        {email && (
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 mb-3"
          >
            {resending ? "Reenviando..." : "Reenviar correo"}
          </button>
        )}
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
