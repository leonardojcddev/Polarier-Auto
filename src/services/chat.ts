import { supabase } from '@/lib/supabaseClient';

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const getChats = async (): Promise<Chat[]> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getLatestChat = async (): Promise<Chat | null> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .maybeSingle();
  if (error) throw error;
  return data;
};
export const createChat = async (title: string): Promise<Chat> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: user.id, title })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateChatTitle = async (chatId: string, title: string): Promise<void> => {
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId);
  if (error) throw error;
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const sendMessage = async (
  chatId: string,
  content: string,
  role: 'user' | 'assistant' = 'user'
): Promise<ChatMessage> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ chat_id: chatId, user_id: user.id, role, content })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id);
  if (error) throw error;
};

export const updateProfile = async (fullName: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
  if (error) throw error;
};

export const getProfile = async (): Promise<{ full_name: string | null; avatar_url: string | null } | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return null;
  return data;
};

// Recursively extract text content from n8n JSON responses
const extractTextContent = (data: unknown): string | null => {
  if (typeof data === 'string') return data.trim() || null;
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    // If array, try to extract from first element
    if (data.length === 0) return null;
    return extractTextContent(data[0]);
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Priority keys for text content
    const keys = ['respuesta', 'response', 'message', 'text', 'content', 'output', 'result', 'answer', 'reply'];
    for (const key of keys) {
      if (obj[key] && typeof obj[key] === 'string') return (obj[key] as string).trim();
    }
    // Check nested objects in priority keys
    for (const key of keys) {
      if (obj[key] && typeof obj[key] === 'object') {
        const nested = extractTextContent(obj[key]);
        if (nested) return nested;
      }
    }
    // Fallback: first string value found
    for (const val of Object.values(obj)) {
      if (typeof val === 'string' && val.trim().length > 0) return val.trim();
    }
    // Last resort: recurse into first object value
    for (const val of Object.values(obj)) {
      if (typeof val === 'object') {
        const nested = extractTextContent(val);
        if (nested) return nested;
      }
    }
  }
  return null;
};

export const sendToN8n = async (
  chatId: string,
  userId: string,
  message: string,
  role: string,
  fileInfo?: { file_name: string; file_path: string; mime_type: string; size_bytes: number },
  userName?: string,
  userEmail?: string
): Promise<string | null> => {
  try {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      user_id: userId,
      user_name: userName ?? null,
      user_email: userEmail ?? null,
      message,
      role,
      timestamp: new Date().toISOString(),
    };
    if (fileInfo) {
      payload.file = fileInfo;
    }
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    
    // If response is a file (not JSON/text), return a download link
    if (contentType.includes('application/pdf') || 
        contentType.includes('application/vnd') || 
        contentType.includes('application/octet-stream')) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const ext = contentType.includes('pdf') ? 'pdf' : 
                  contentType.includes('spreadsheet') || contentType.includes('xlsx') ? 'xlsx' :
                  contentType.includes('word') || contentType.includes('docx') ? 'docx' : 'file';
      return `[Archivo recibido](${url}){.file-download|${ext}}`;
    }

    if (contentType.includes('application/json')) {
      const json = await res.json();
      // Extract meaningful text content from any JSON structure
      return extractTextContent(json);
    }
    const text = await res.text();
    return text.trim() || null;
  } catch {
    return null;
  }
};
