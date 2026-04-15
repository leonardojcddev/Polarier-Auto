---
name: debug-app
description: Diagnosticar y resolver bugs en la aplicación Polarier-Auto, revisando logs, flujo de datos y estado de Supabase
argument-hint: "[descripcion-del-bug]"
allowed-tools: "Read Edit Grep Glob Bash"
---

# Depuración de la App

Diagnostica y resuelve el bug reportado siguiendo este flujo:

## Estrategia de depuración

### 1. Entender el problema
- Lee el componente o página afectada
- Identifica el flujo de datos: ¿viene de Supabase? ¿del contexto Auth? ¿del webhook n8n?

### 2. Puntos comunes de fallo

**Autenticación:**
- `useAuth()` devuelve `loading: true` indefinidamente — revisar `AuthContext.tsx`
- Sesión perdida — la auth usa `sessionStorage` (se pierde al cerrar pestaña, es intencional)
- Recovery flow — detecta `type=recovery` en URL, revisa `hasRecoveryParams()`

**Supabase queries:**
- RLS (Row Level Security) bloqueando queries — el usuario solo ve sus propios datos
- Campos null por `strictNullChecks: false` — TypeScript no avisa de nulls

**Chat y webhook n8n:**
- `sendToN8n` devuelve `null` — puede ser error de red, respuesta no-OK, o JSON sin keys reconocidas
- `extractTextContent` busca keys en este orden: `respuesta`, `response`, `message`, `text`, `content`, `output`, `result`, `answer`, `reply`
- Respuestas de archivo (PDF/XLSX/DOCX) se detectan por content-type

**Storage:**
- Validación de tipos: avatars (jpeg/png/webp/gif, 2MB), documents (pdf/xlsx/doc/docx, 20MB)
- Path de archivo: `{userId}/{timestamp}-{safeName}`

**UI/Routing:**
- Rutas protegidas redirigen a `/login`, públicas a `/lobby`
- AppLayout usa `<Outlet />` — si la página no renderiza, verificar que la ruta esté dentro del Route group correcto en `App.tsx`

### 3. Verificar
- Revisa que el fix no rompa otros flujos
- Comprueba que los tipos estén correctos
- Ejecuta `bun run lint` para verificar

Bug a resolver: $ARGUMENTS
