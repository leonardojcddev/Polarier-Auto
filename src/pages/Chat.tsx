import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { Plus, Menu } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { PendingFile } from "@/components/FilePreviewCard";
import { createChat, getMessages, getLatestChat, getChatById, sendMessage, sendToN8n, updateChatTitle, ChatMessage as ChatMsg } from "@/services/chat";
import { uploadDocument } from "@/services/storage";
import botAvatar from "@/assets/bot-avatar.svg";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { LayoutContext } from "@/components/AppLayout";

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebar } = useOutletContext<LayoutContext>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId ?? null);
  const [chatTitle, setChatTitle] = useState("Nueva conversación");
  const [isTyping, setIsTyping] = useState(false);

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";
  const userEmail = user?.email || "";

  const redirected = useRef(false);
  const initialActionHandled = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  };

  // Auto-redirect to latest chat if no chatId in URL
  useEffect(() => {
    if (chatId || redirected.current) {
      setInitialLoading(false);
      return;
    }
    redirected.current = true;
    getLatestChat().then((chat) => {
      if (chat) {
        navigate(`/chat/${chat.id}`, { replace: true });
      } else {
        setInitialLoading(false);
      }
    }).catch(() => setInitialLoading(false));
  }, [chatId, navigate]);

  useEffect(() => {
    setCurrentChatId(chatId ?? null);
  }, [chatId]);

  // Handle initial message or file from lobby navigation
  useEffect(() => {
    if (initialActionHandled.current || !currentChatId) return;
    const state = location.state as { initialMessage?: string; initialFile?: File } | null;
    if (state?.initialMessage) {
      initialActionHandled.current = true;
      // Clear navigation state to prevent re-trigger
      window.history.replaceState({}, "");
      setInput(state.initialMessage);
      // Trigger send after messages load
      setTimeout(() => {
        setInput("");
        // Manually call send logic
        const doSend = async () => {
          setLoading(true);
          setIsTyping(true);
          const messageText = state.initialMessage!;
          try {
            const msg = await sendMessage(currentChatId, messageText, "user");
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
            // Auto-title
            const title = messageText.slice(0, 60);
            setChatTitle(title);
            updateChatTitle(currentChatId, title).then(() => {
              window.dispatchEvent(new CustomEvent('chat-title-updated'));
            }).catch(() => {});
            const n8nResponse = await sendToN8n(currentChatId, user?.id || '', messageText, 'user', undefined, userName, userEmail);
            setIsTyping(false);
            if (n8nResponse) {
              const botMsg = await sendMessage(currentChatId, n8nResponse, "assistant");
              setMessages((prev) => [...prev, botMsg]);
              scrollToBottom();
            }
          } catch (err: any) {
            setIsTyping(false);
            toast.error(err.message || "Error enviando mensaje");
          } finally {
            setLoading(false);
          }
        };
        doSend();
      }, 100);
    } else if (state?.initialFile) {
      initialActionHandled.current = true;
      window.history.replaceState({}, "");
      setTimeout(() => handleFileUpload(state.initialFile!), 100);
    }
  }, [currentChatId, location.state]);

  useEffect(() => {
    if (currentChatId) {
      getMessages(currentChatId).then((msgs) => {
        setMessages(msgs);
        scrollToBottom("instant");
      }).catch(() => toast.error("Error cargando mensajes"));
      getChatById(currentChatId).then((chat) => {
        if (chat) setChatTitle(chat.title);
      }).catch(() => {});
    } else {
      setMessages([]);
      setChatTitle("Nueva conversación");
    }
  }, [currentChatId]);

  const handleNewChat = async () => {
    try {
      const chat = await createChat("Nueva conversación");
      navigate(`/chat/${chat.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error creando chat");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setIsTyping(true);
    const messageText = input.trim();
    setInput("");

    try {
      let activeChatId = currentChatId;
      if (!activeChatId) {
        const chat = await createChat("Nueva conversación");
        activeChatId = chat.id;
        setCurrentChatId(chat.id);
        navigate(`/chat/${chat.id}`, { replace: true });
      }

      const msg = await sendMessage(activeChatId, messageText, "user");
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();

      // Auto-title
      const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;
      if (isFirstMessage || chatTitle === "Nueva conversación") {
        const title = messageText.slice(0, 60);
        setChatTitle(title);
        updateChatTitle(activeChatId, title).then(() => {
          window.dispatchEvent(new CustomEvent('chat-title-updated'));
        }).catch(() => {});
      }

      // Send to n8n
      const n8nResponse = await sendToN8n(activeChatId, user?.id || '', messageText, 'user', undefined, userName, userEmail);
      setIsTyping(false);
      if (n8nResponse) {
        const botMsg = await sendMessage(activeChatId, n8nResponse, "assistant");
        setMessages((prev) => [...prev, botMsg]);
        scrollToBottom();
      }
    } catch (err: any) {
      setIsTyping(false);
      toast.error(err.message || "Error enviando mensaje");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const isAudio = file.type.startsWith("audio/");
    const label = isAudio ? "🎤 Audio" : `📎 Documento subido: ${file.name}`;

    setPendingFile({ file, status: "uploading", progress: 30 });

    try {
      let activeChatId = currentChatId;
      if (!activeChatId) {
        const chat = await createChat("Nueva conversación");
        activeChatId = chat.id;
        setCurrentChatId(chat.id);
        navigate(`/chat/${chat.id}`, { replace: true });
      }

      setPendingFile((prev) => prev ? { ...prev, progress: 60 } : null);
      const doc = await uploadDocument(file, activeChatId);
      setPendingFile((prev) => prev ? { ...prev, progress: 90 } : null);

      const userMessage = isAudio ? label : `📎 Documento subido: ${doc.file_name}`;
      const msg = await sendMessage(activeChatId, userMessage, "user");
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();

      setPendingFile((prev) => prev ? { ...prev, status: "uploaded", progress: 100 } : null);
      setTimeout(() => setPendingFile(null), 2000);

      setIsTyping(true);
      const n8nResponse = await sendToN8n(activeChatId, user?.id || '', userMessage, 'user', {
        id: doc.id,
        file_name: doc.file_name,
        file_path: doc.file_path,
        mime_type: doc.mime_type,
        size_bytes: doc.size_bytes,
      }, userName, userEmail);
      setIsTyping(false);
      if (n8nResponse) {
        const botMsg = await sendMessage(activeChatId, n8nResponse, "assistant");
        setMessages((prev) => [...prev, botMsg]);
        scrollToBottom();
      }
      if (!isAudio) toast.success("Documento subido correctamente");
    } catch (err: any) {
      setIsTyping(false);
      setPendingFile((prev) => prev ? { ...prev, status: "error", error: err.message } : null);
      toast.error(err.message || (isAudio ? "Error enviando audio" : "Error subiendo documento"));
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    
    const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (isToday) return time;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
    if (isYesterday) return `Ayer, ${time}`;

    const day = d.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${day} ${months[d.getMonth()]}, ${time}`;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full chat-bg">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-3 bg-background/70 backdrop-blur-md border-b border-border/40 safe-top">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={openSidebar}
            className="lg:hidden p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{chatTitle}</h1>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva conversación</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !currentChatId && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Envía un mensaje para comenzar una conversación</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            sender={msg.role === "user" ? "user" : "bot"}
            text={msg.content}
            time={formatTime(msg.created_at)}
            initial={profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            avatarUrl={msg.role === "user" ? profile?.avatar_url : undefined}
          />
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src={botAvatar} alt="Bot" className="w-5 h-5" />
            </div>
            <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 text-sm text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="inline-block w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="inline-block w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={loading}
        uploading={!!pendingFile && pendingFile.status === "uploading"}
        pendingFile={pendingFile}
        onRemovePendingFile={() => setPendingFile(null)}
        onRetryPendingFile={() => {
          if (pendingFile) handleFileUpload(pendingFile.file);
        }}
        onFileSelect={handleFileUpload}
        onAudioSend={handleFileUpload}
      />
    </div>
  );
};

export default Chat;