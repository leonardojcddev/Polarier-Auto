---
name: supabase-service
description: Crear o modificar funciones de servicio que interactúan con Supabase (base de datos, auth, storage) siguiendo el patrón existente en src/services/
argument-hint: "[nombre-servicio] [descripcion]"
allowed-tools: "Read Write Edit Grep Glob"
---

# Servicio Supabase

Crea o modifica funciones de servicio para interactuar con Supabase.

## Patrón del proyecto

Todas las funciones de servicio siguen este patrón (ver `src/services/chat.ts`, `auth.ts`, `storage.ts`):

```ts
import { supabase } from '@/lib/supabaseClient';

export const miFuncion = async (params): Promise<TipoRetorno> => {
  // Si necesita usuario autenticado:
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('tabla')
    .select('*')  // o .insert(), .update(), .delete()
    .eq('campo', valor);

  if (error) throw error;
  return data;
};
```

## Tablas conocidas en Supabase

- `chats` — id, user_id, title, created_at, updated_at
- `chat_messages` — id, chat_id, user_id, role ('user'|'assistant'), content, created_at
- `profiles` — id, full_name, avatar_url, updated_at
- `documents` — id, user_id, chat_id, file_name, file_path, mime_type, size_bytes, status, created_at

## Buckets de Storage

- `avatars` — imágenes de perfil (max 2MB, tipos: jpeg, png, webp, gif)
- `documents` — documentos (max 20MB, tipos: pdf, xlsx, doc, docx)

## Reglas

- Importa siempre desde `@/lib/supabaseClient`
- Exporta funciones `async` con tipos de retorno explícitos
- Lanza errores con `throw error` (no los silencies)
- Para archivos de Storage, usa `upsert: true` solo para avatars
- Valida tipos MIME y tamaños antes de subir archivos
- Los mensajes de error al usuario deben estar en español
- Archivos de servicio van en `src/services/`

Implementa: $ARGUMENTS
