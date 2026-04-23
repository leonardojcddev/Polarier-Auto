import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/chat";
import { uploadAvatar } from "@/services/storage";
import { updatePassword } from "@/services/auth";
import { toast } from "sonner";
import AvatarCropper from "@/components/AvatarCropper";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const email = user?.email ?? "";
  const defaultName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || email.split("@")[0];
  const [fullName, setFullName] = useState(defaultName || "");

  useEffect(() => {
    if (defaultName) setFullName(defaultName);
  }, [defaultName]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleUser = user?.app_metadata?.provider === 'google';
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }, [profile?.avatar_url]);

  const initial = fullName?.charAt(0).toUpperCase() || "U";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropperSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCroppedConfirm = async (blob: Blob) => {
    setCropperSrc(null);
    setUploading(true);
    try {
      const file = new File([blob], `avatar-${Date.now()}.png`, { type: "image/png" });
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      toast.success("Foto de perfil actualizada");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(fullName.trim());
      toast.success("Perfil actualizado correctamente");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error actualizando perfil");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    setPasswordSuccess(false);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      toast.success("Contraseña actualizada correctamente");
    } catch (err: any) {
      setPasswordError(err.message || "Error al actualizar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6">Configuración</h1>

      <div className="max-w-2xl mx-auto bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <User size={20} className="text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Mi perfil</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-secondary-foreground overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Foto de perfil</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Subir imagen"}
            </button>
          </div>
        </div>

        {cropperSrc && (
          <AvatarCropper
            imageSrc={cropperSrc}
            open={!!cropperSrc}
            onClose={() => setCropperSrc(null)}
            onConfirm={handleCroppedConfirm}
          />
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Correo electrónico</label>
            <input
              type="email"
              defaultValue={email}
              disabled
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {isGoogleUser ? "Crear contraseña" : "Cambiar contraseña"}
          </h3>

          {isGoogleUser && (
            <p className="text-xs text-muted-foreground mb-4">
              Entraste con Google. Puedes crear una contraseña para iniciar sesión también con email y contraseña.
            </p>
          )}

          {passwordSuccess && (
            <p className="text-sm text-green-600 mb-4 font-medium">Contraseña actualizada correctamente.</p>
          )}

          <div className="space-y-4">
            {!isGoogleUser && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {isGoogleUser ? "Nueva contraseña" : "Nueva contraseña"}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring bg-card"
              />
            </div>
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="mt-5 px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {saving ? "Guardando..." : isGoogleUser ? "Crear contraseña" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
