import { useState, useEffect } from "react";
import { FileText, FileSpreadsheet, File, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { getDocuments, downloadDocument } from "@/services/storage";
import { toast } from "sonner";

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (doc: any) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc.file_path, doc.file_name);
    } catch (err) {
      console.error('Download error:', err);
      toast.error("Error al descargar el documento");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="El agente no te ha enviado documentos aún"
        subtitle="Los archivos que te envíe el agente aparecerán aquí."
        buttonLabel="Ir al chat"
        onButtonClick={() => navigate("/chat")}
      />
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText size={20} className="text-red-400 shrink-0" />;
    if (['xlsx', 'xls'].includes(ext)) return <FileSpreadsheet size={20} className="text-green-400 shrink-0" />;
    if (['docx', 'doc'].includes(ext)) return <FileText size={20} className="text-blue-400 shrink-0" />;
    return <File size={20} className="text-muted-foreground shrink-0" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6">Mis Documentos</h1>
      <div className="max-w-3xl mx-auto space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon(doc.file_name)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.size_bytes)} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(doc)}
              disabled={downloadingId === doc.id}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
            >
              {downloadingId === doc.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
