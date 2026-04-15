---
name: optimize-performance
description: Optimizar rendimiento de componentes React - memoización, lazy loading, reducción de re-renders y optimización de queries
argument-hint: "[componente-o-area]"
allowed-tools: "Read Edit Grep Glob"
---

# Optimización de Rendimiento

Analiza y optimiza el rendimiento del componente o área indicada.

## Checklist de optimización

### Re-renders innecesarios
- Usa `React.memo()` para componentes que reciben las mismas props frecuentemente
- Usa `useMemo` para cálculos costosos derivados de estado
- Usa `useCallback` para funciones pasadas como props a componentes memoizados
- Evita crear objetos/arrays inline en JSX (`style={{}}`, `options={[]}`)

### Lazy loading de páginas
```tsx
import { lazy, Suspense } from "react";
const MiPagina = lazy(() => import("./pages/MiPagina"));

// En el router:
<Route path="/ruta" element={
  <Suspense fallback={<div>Cargando...</div>}>
    <MiPagina />
  </Suspense>
} />
```

### React Query (TanStack Query)
- Configura `staleTime` para evitar refetches innecesarios
- Usa `queryKey` correctos para invalidación precisa
- Usa `enabled` para queries condicionales
- Prefiere `useQuery` sobre `useEffect` + `useState` para datos de Supabase

### Imágenes y assets
- Usa `loading="lazy"` en imágenes fuera del viewport
- Comprime avatars antes de subir (el proyecto ya valida 2MB max)
- Usa formatos modernos (WebP) cuando sea posible

### Bundle size
- Importa solo lo necesario de lucide-react: `import { Icon } from "lucide-react"` (ya tree-shakeable)
- Evita importar librerías completas cuando solo necesitas una función

Optimizar: $ARGUMENTS
