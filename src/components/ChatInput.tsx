import { useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import FilePreviewCard, { PendingFile } from "@/components/FilePreviewCard";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onFileSelect?: (file: File) => void;
  uploading?: boolean;
  disabled?: boolean;
  pendingFile?: PendingFile | null;
  onRemovePendingFile?: () => void;
  onRetryPendingFile?: () => void;
}

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ChatInput = ({ value, onChange, onSend, onFileSelect, uploading, disabled, pendingFile, onRemovePendingFile, onRetryPendingFile }: ChatInputProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      alert("Solo se permiten archivos PDF, XLSX, DOC y DOCX");
      return;
    }
    onFileSelect?.(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {pendingFile && (
          <div className="mb-2">
            <FilePreviewCard
              pendingFile={pendingFile}
              onRemove={() => onRemovePendingFile?.()}
              onRetry={() => onRetryPendingFile?.()}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.xlsx,.doc,.docx"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Escribe tu mensaje o sube un documento..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}
            disabled={disabled}
            className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={disabled}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={16} className="text-primary" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Formatos soportados: PDF, XLSX, DOC, DOCX
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
