import { useEffect, useState } from "react";
import { Clock, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getChats, Chat, createChat, deleteChat } from "@/services/chat";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const History = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadChats = () => {
    getChats()
      .then(setChats)
      .catch(() => toast.error("Error cargando historial"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const chat = await createChat("Nueva conversación");
      navigate(`/chat/${chat.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error creando chat");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteChat(deletingId);
      toast.success("Conversación eliminada");
      loadChats();
    } catch (err: any) {
      toast.error(err.message || "Error eliminando chat");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground text-sm">Cargando...</span>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
          <Clock size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Tu historial está vacío</h2>
        <p className="text-sm text-muted-foreground mb-4">Empieza una conversación para verla aquí.</p>
        <button
          onClick={handleNewChat}
          className="px-5 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva conversación
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Historial</h1>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nueva conversación
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="w-full flex items-center gap-3 px-6 py-4 border-b border-border hover:bg-muted/50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {chat.title || "Sin título"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(chat.created_at)}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDeletingId(chat.id); }}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              title="Eliminar conversación"
            >
              <Trash2 size={16} />
            </button>
          </button>
        ))}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
