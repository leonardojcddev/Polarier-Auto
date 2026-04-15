---
name: react-component
description: Crear un nuevo componente React con TypeScript, Tailwind CSS y shadcn/ui siguiendo las convenciones del proyecto Polarier-Auto
argument-hint: "[NombreComponente] [descripcion]"
allowed-tools: "Read Write Edit Grep Glob"
---

# Crear Componente React

Crea un nuevo componente React para la app Polarier-Auto siguiendo estas reglas:

## Convenciones del proyecto

- Usa **TypeScript** con tipos explícitos para props (interface `NombreComponenteProps`)
- Usa **export default** para el componente principal
- Estilos con **Tailwind CSS** usando las clases de diseño del proyecto (ver `tailwind.config.ts`)
- Usa los colores semánticos del tema: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `card`, `sidebar-bg`, `sidebar-fg`, `sidebar-muted`, `sidebar-active`
- Fuente: `font-sans` (Inter)
- Importa utilidades de `@/lib/utils` (función `cn` para merge de clases)
- Usa componentes de `@/components/ui/` (shadcn/ui) siempre que sea posible (Button, Card, Input, Dialog, etc.)
- Iconos: usa `lucide-react`
- Todo texto visible al usuario debe estar en **español**
- Path alias: `@/` = `src/`
- El archivo va en `src/components/` (no en `ui/`, esa carpeta es solo para shadcn)

## Estructura del componente

```tsx
import { cn } from "@/lib/utils";

interface $ARGUMENTSProps {
  // props tipadas
}

const $ARGUMENTS = ({ ...props }: $ARGUMENTSProps) => {
  return (
    // JSX con Tailwind
  );
};

export default $ARGUMENTS;
```

## Diseño responsive

- Mobile-first: empieza con diseño móvil, luego `sm:`, `md:`, `lg:`
- Breakpoint principal de layout: `lg:` (sidebar se oculta en mobile)
- Usa `flex` y `grid` para layouts
- Evita anchos fijos, prefiere `w-full`, `max-w-*`, `flex-1`

## Hooks disponibles

- `useAuth()` de `@/context/AuthContext` — usuario, sesión, perfil, login, logout
- `use-mobile.tsx` — detección de pantalla móvil
- `use-toast.ts` — notificaciones toast

Crea el componente para: $ARGUMENTS
