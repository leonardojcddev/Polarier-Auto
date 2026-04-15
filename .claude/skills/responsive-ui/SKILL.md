---
name: responsive-ui
description: Revisar y mejorar la responsividad de componentes para que funcionen correctamente en móvil, tablet y escritorio
argument-hint: "[archivo-o-componente]"
allowed-tools: "Read Edit Grep Glob"
---

# Revisión de Responsividad

Revisa y corrige problemas de responsive design en el componente indicado.

## Sistema de breakpoints (Tailwind)

- Base (sin prefijo): móvil (< 640px)
- `sm:` — >= 640px
- `md:` — >= 768px (tablet)
- `lg:` — >= 1024px (desktop, aquí se muestra el sidebar)
- `xl:` — >= 1280px
- `2xl:` — >= 1400px (max-width del container)

## Patrones del proyecto

- **Sidebar**: se oculta en mobile, visible desde `lg:`. Botón hamburguesa en `<div className="lg:hidden">` (ver `AppLayout.tsx`)
- **Container**: `max-w-[1400px]`, centrado con `padding: 2rem`
- **Contenido principal**: usa `flex-1 overflow-y-auto` dentro de AppLayout

## Checklist de revisión

1. **Overflow**: buscar anchos fijos que causen scroll horizontal en móvil
2. **Texto**: verificar que no se corte (`truncate`, `break-words`, `line-clamp-*`)
3. **Touch targets**: botones y links deben tener al menos 44x44px en móvil
4. **Espaciado**: padding/margin razonables — `p-4` en móvil, `p-6 md:p-8` en desktop
5. **Grid/Flex**: columnas que colapsen — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
6. **Imágenes/Avatars**: usar `aspect-ratio`, evitar alturas fijas
7. **Modals/Dialogs**: que no se desborden en móvil, usar `max-h-[80vh] overflow-y-auto`
8. **Inputs/Forms**: `w-full` en móvil

## Reglas

- Mobile-first: escribe estilos base para móvil, luego agrega breakpoints
- No uses `hidden` sin un breakpoint correspondiente que lo muestre
- Prefiere `min-h-screen` sobre `h-screen` cuando hay contenido scrollable
- Usa el hook `useMobile()` de `@/hooks/use-mobile` solo cuando CSS no baste

Revisar: $ARGUMENTS
