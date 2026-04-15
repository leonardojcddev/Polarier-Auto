---
name: new-page
description: Crear una nueva página/vista con su ruta en React Router, integrándola al sistema de navegación y layout existente
argument-hint: "[NombrePagina] [ruta] [protegida|publica]"
allowed-tools: "Read Write Edit Grep Glob"
---

# Nueva Página

Crea una nueva página y regístrala en el router.

## Pasos

1. **Crear el archivo** en `src/pages/NombrePagina.tsx`
2. **Registrar la ruta** en `src/App.tsx`
3. **Agregar navegación** en `src/components/AppSidebar.tsx` si aplica

## Estructura de la página

```tsx
const NombrePagina = () => {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Título</h1>
      {/* contenido */}
    </div>
  );
};

export default NombrePagina;
```

## Tipos de ruta en App.tsx

**Protegida con layout (sidebar)** — para secciones principales de la app:
```tsx
<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  <Route path="/mi-ruta" element={<MiPagina />} />
</Route>
```

**Protegida sin layout** — como Lobby:
```tsx
<Route path="/mi-ruta" element={<ProtectedRoute><MiPagina /></ProtectedRoute>} />
```

**Pública** — redirige a /lobby si ya está logueado:
```tsx
<Route path="/mi-ruta" element={<PublicRoute><MiPagina /></PublicRoute>} />
```

## Convenciones

- Textos en español
- Usa los hooks `useAuth()` para datos del usuario
- `useNavigate()` y `useParams()` de react-router-dom para navegación
- Responsive: mobile-first con breakpoints `sm:`, `md:`, `lg:`
- Si la página hace fetch de datos, usa `@tanstack/react-query`

Crear página: $ARGUMENTS
