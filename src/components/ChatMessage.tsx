import { useState } from "react";
import botAvatar from "@/assets/bot-avatar.svg";
import { Download, X } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";

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
  | { kind: "image"; url: string; mime: string }
  | { kind: "file"; url: string; ext: string; label: string };

const parseMessage = (raw: string): Parsed => {
  const audioMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.audio-player\|([^}]+)\}$/);
  if (audioMatch) {
    return { kind: "audio", url: audioMatch[2], mime: audioMatch[3] };
  }
  const imageMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.image\|([^}]+)\}$/);
  if (imageMatch) {
    return { kind: "image", url: imageMatch[2], mime: imageMatch[3] };
  }
  const fileMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.file-download\|([^}]+)\}$/);
  if (fileMatch) {
    return { kind: "file", label: fileMatch[1], url: fileMatch[2], ext: fileMatch[3] };
  }
  return { kind: "text", text: raw };
};

const ImageThumb = ({ url }: { url: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block rounded-lg overflow-hidden max-w-[260px] sm:max-w-xs hover:opacity-90 transition-opacity"
      >
        <img src={url} alt="Imagen" className="w-full h-auto object-cover" loading="lazy" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <img
            src={url}
            alt="Imagen ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const ChatMessage = ({ sender, text, time, initial = "U", avatarUrl }: ChatMessageProps) => {
  const parsed = parseMessage(text);

  // Audio: burbuja compacta estilo WhatsApp, el avatar va dentro del reproductor.
  if (parsed.kind === "audio") {
    const bubbleClass =
      sender === "bot"
        ? "bg-muted rounded-xl rounded-tl-sm px-3 py-2"
        : "bg-secondary/20 rounded-xl rounded-tr-sm px-3 py-2";
    return (
      <div className={`flex max-w-2xl ${sender === "bot" ? "" : "ml-auto flex-row-reverse"}`}>
        <div className={sender === "bot" ? "" : "text-right"}>
          <div className={bubbleClass}>
            <AudioPlayer
              src={parsed.url}
              sender={sender}
              initial={initial}
              avatarUrl={avatarUrl}
              botAvatarSrc={sender === "bot" ? botAvatar : undefined}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
        </div>
      </div>
    );
  }

  let body: JSX.Element;
  if (parsed.kind === "file") {
    body = (
      <a
        href={parsed.url}
        download
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border text-sm font-medium hover:bg-background transition-colors"
      >
        <Download size={16} />
        {parsed.label} ({parsed.ext.toUpperCase()})
      </a>
    );
  } else if (parsed.kind === "image") {
    body = <ImageThumb url={parsed.url} />;
  } else {
    body = <span className="whitespace-pre-wrap">{parsed.text}</span>;
  }

  const bubblePadding = parsed.kind === "image" ? "p-1.5" : "px-4 py-3";

  if (sender === "bot") {
    return (
      <div className="flex gap-3 max-w-2xl">
        <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img src={botAvatar} alt="Bot" className="w-5 h-5" />
        </div>
        <div>
          <div className={`bg-muted rounded-xl rounded-tl-sm text-sm text-foreground ${bubblePadding}`}>
            {body}
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
        <div className={`bg-secondary/20 rounded-xl rounded-tr-sm text-sm text-foreground ${bubblePadding}`}>
          {body}
        </div>
        <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
