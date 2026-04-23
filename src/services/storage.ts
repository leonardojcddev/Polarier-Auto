import { supabase } from '@/lib/supabaseClient';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

export const uploadAvatar = async (file: File): Promise<string> => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)');
  }
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('La imagen no puede superar 2MB');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const ext = file.name.split('.').pop() || 'png';
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (profileError) throw profileError;

  return avatarUrl;
};

export const uploadDocument = async (
  file: File,
  chatId?: string
): Promise<{
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
}> => {
  const isAudio = file.type.startsWith('audio/');
  if (!isAudio && !ALLOWED_DOC_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten archivos PDF, XLSX, DOC, DOCX o audio');
  }
  const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_DOC_SIZE;
  if (file.size > maxSize) {
    throw new Error(isAudio ? 'El audio no puede superar 15MB' : 'El archivo no puede superar 20MB');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${user.id}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      chat_id: chatId || null,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type,
      size_bytes: file.size,
      status: 'uploaded',
    })
    .select()
    .single();
  if (insertError) throw insertError;

  return data;
};

export const getDocuments = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const downloadDocument = async (filePath: string, fileName: string): Promise<void> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath);
  if (error || !data) throw new Error('No se pudo descargar el documento');

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const cleanupOldDocuments = async (): Promise<void> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: oldDocs, error } = await supabase
    .from('documents')
    .select('id, file_path')
    .lt('created_at', sevenDaysAgo.toISOString());

  if (error || !oldDocs || oldDocs.length === 0) return;

  // Delete files from Storage
  const filePaths = oldDocs.map((doc: any) => doc.file_path);
  await supabase.storage.from('documents').remove(filePaths);

  // Delete records from DB
  const ids = oldDocs.map((doc: any) => doc.id);
  await supabase.from('documents').delete().in('id', ids);
};
