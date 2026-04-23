import botAvatar from "@/assets/bot-avatar.svg";
import { Download } from "lucide-react";

interface ChatMessageProps {
  sender: "bot" | "user";
  text: string;
  time: string;
  initial?: string;
  avatarUrl?: string | null;
}

type Parsed =
  | { kind: "text"; text: string }
  | { kind: "audio"; url: string; mime: string }
  | { kind: "file"; url: string; ext: string; label: string };

/**
 * Soporta los markers embebidos que sendToN8n / uploadDocument generan:
 *   [Audio](url){.audio-player|audio/mpeg}
 *   [Archivo recibido](url){.file-download|pdf}
 * Cualquier otro texto se muestra tal cual.
 */
const parseMessage = (raw: string): Parsed => {
  const audioMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.audio-player\|([^}]+)\}$/);
  if (audioMatch) {
    return { kind: "audio", url: audioMatch[2], mime: audioMatch[3] };
  }
  const fileMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.file-download\|([^}]+)\}$/);
  if (fileMatch) {
    return { kind: "file", label: fileMatch[1], url: fileMatch[2], ext: fileMatch[3] };
  }
  return { kind: "text", text: raw };
};

const MessageBody = ({ raw }: { raw: string }) => {
  const parsed = parseMessage(raw);
  if (parsed.kind === "audio") {
    return (
      <audio
        controls
        src={parsed.url}
        className="max-w-[260px] sm:max-w-xs"
        preload="metadata"
      >
        Tu navegador no soporta audio.
      </audio>
    );
  }
  if (parsed.kind === "file") {
    return (
      <a
        href={parsed.url}
        download
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border text-sm font-medium hover:bg-background transition-colors"
      >
        <Download size={16} />
        {parsed.label} ({parsed.ext.toUpperCase()})
      </a>
    );
  }
  return <span className="whitespace-pre-wrap">{parsed.text}</span>;
};

const ChatMessage = ({ sender, text, time, initial = "U", avatarUrl }: ChatMessageProps) => {
  if (sender === "bot") {
    return (
      <div className="flex gap-3 max-w-2xl">
        <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img src={botAvatar} alt="Bot" className="w-5 h-5" />
        </div>
        <div>
          <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 text-sm text-foreground">
            <MessageBody raw={text} />
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-2xl ml-auto flex-row-reverse">
      <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold text-secondary-foreground overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div className="text-right">
        <div className="bg-secondary/20 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-foreground">
          <MessageBody raw={text} />
        </div>
        <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
