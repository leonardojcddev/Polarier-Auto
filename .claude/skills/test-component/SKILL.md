---
name: test-component
description: Crear tests unitarios o de integración para componentes React usando Vitest + Testing Library
argument-hint: "[componente-o-servicio]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---

# Tests para Componentes

Crea tests para el componente o servicio indicado usando el stack de testing del proyecto.

## Stack de testing

- **Vitest** — test runner (compatible con Jest API)
- **jsdom** — entorno DOM simulado
- **@testing-library/react** — render y queries de componentes
- **@testing-library/jest-dom** — matchers adicionales (`.toBeInTheDocument()`, etc.)
- **Playwright** — tests E2E (fixture en `playwright-fixture.ts`)

## Configuración

- Tests en: `src/**/*.{test,spec}.{ts,tsx}`
- Setup: `src/test/setup.ts`
- Globals habilitados (`describe`, `it`, `expect` sin importar)
- Alias `@/` disponible en tests

## Plantilla de test para componentes

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MiComponente from "@/components/MiComponente";

describe("MiComponente", () => {
  it("renderiza correctamente", () => {
    render(<MiComponente />);
    expect(screen.getByText("Texto esperado")).toBeInTheDocument();
  });

  it("maneja interacción", async () => {
    const user = userEvent.setup();
    render(<MiComponente />);
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(screen.getByText("Resultado")).toBeInTheDocument();
  });
});
```

## Plantilla de test para servicios

```ts
import { describe, it, expect, vi } from "vitest";

// Mock de Supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-id" } } }) },
  },
}));
```

## Comandos

- `bun run test` — ejecutar todos los tests
- `bun run test:watch` — modo watch
- `bunx vitest run src/path/to/file.test.ts` — un solo archivo

Crear tests para: $ARGUMENTS
