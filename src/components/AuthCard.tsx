import polarierLogo from "@/assets/polarier-logo.png";

interface AuthCardProps {
  children: React.ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={polarierLogo} alt="Polarier" className="h-12 mx-auto" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
