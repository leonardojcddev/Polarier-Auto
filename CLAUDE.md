# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polarier-Auto is a Spanish-language chat application built with React + TypeScript + Vite. It uses Supabase for auth, database, and storage, and forwards chat messages to an n8n webhook for AI-powered responses. The UI is built with shadcn/ui components and Tailwind CSS.

## Commands

- `bun dev` — Start dev server on port 8080
- `bun run build` — Production build
- `bun run lint` — ESLint
- `bun run test` — Run all tests (vitest)
- `bun run test:watch` — Watch mode
- `bunx vitest run src/path/to/file.test.ts` — Run a single test file

## Architecture

**Routing & Auth Flow:** `App.tsx` defines all routes using react-router-dom. Routes are wrapped in `ProtectedRoute` (redirects to `/login` if unauthenticated) or `PublicRoute` (redirects to `/lobby` if already logged in). Password recovery flow is detected via URL params and redirects to `/reset-password`.

**Layout:** Authenticated pages under `/chat`, `/documents`, `/history`, `/settings` render inside `AppLayout`, which provides a sidebar + main content area via `<Outlet />`. The `/lobby` page is protected but uses its own layout.

**Backend Integration:**
- `src/lib/supabaseClient.ts` — Supabase client (uses `sessionStorage` for auth persistence)
- `src/services/auth.ts` — Auth operations (email/password, Google OAuth, sign out)
- `src/services/chat.ts` — Chat CRUD, message CRUD, profile management, and n8n webhook integration
- `src/services/storage.ts` — File uploads (avatars to `avatars` bucket, documents to `documents` bucket) with type/size validation
- `src/context/AuthContext.tsx` — Global auth state via React context, exposes `useAuth()` hook

**Chat Flow:** User messages are saved to Supabase `chat_messages` table, then forwarded to the n8n webhook (`sendToN8n`). The webhook response is parsed with `extractTextContent` which handles nested JSON structures, looking for keys like `respuesta`, `response`, `message`, etc. File responses (PDF, XLSX, DOCX) are returned as blob download links.

**Supabase Tables:** `chats`, `chat_messages`, `profiles`, `documents`

**Supabase Storage Buckets:** `avatars`, `documents`

## Android (Capacitor)

The project is wrapped with Capacitor to produce a native Android app from the web build.

- `npm run android:sync` — Build web + sync to Android project
- `npm run android:open` — Open the Android project in Android Studio
- `npm run android:run` — Build, sync, and run on connected device/emulator
- Android project lives in `android/` (generated, do not edit manually except for native configs)
- Config in `capacitor.config.ts` — appId: `com.polarier.auto`

## Key Conventions

- Path alias: `@/` maps to `src/`
- UI components live in `src/components/ui/` (shadcn/ui, do not edit manually)
- Custom components in `src/components/`
- All user-facing text is in Spanish
- Package manager is bun (lockfile: `bun.lock`)
- TypeScript is configured with `strictNullChecks: false` and `noImplicitAny: false`
