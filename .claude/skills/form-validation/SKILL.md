---
name: form-validation
description: Crear formularios con validación usando react-hook-form + zod + componentes shadcn/ui del proyecto
argument-hint: "[descripcion-del-formulario]"
allowed-tools: "Read Write Edit Grep Glob"
---

# Formulario con Validación

Crea un formulario validado usando el stack del proyecto: react-hook-form + zod + shadcn/ui.

## Stack de formularios

- **react-hook-form** — manejo de estado del formulario
- **zod** — esquema de validación
- **@hookform/resolvers** — conectar zod con react-hook-form
- **shadcn/ui Form** — componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

## Plantilla

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  campo: z.string().min(1, "Este campo es obligatorio"),
  email: z.string().email("Email no válido"),
});

type FormValues = z.infer<typeof formSchema>;

const MiFormulario = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { campo: "", email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    // lógica de envío
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="campo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiqueta</FormLabel>
              <FormControl>
                <Input placeholder="Escribe aquí..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
};
```

## Reglas

- Mensajes de validación en español
- Usa `z.string().min(1, "...")` en vez de `z.string().nonempty()` (deprecated)
- Deshabilita el botón de submit mientras `isSubmitting`
- Usa `toast` de `@/hooks/use-toast` para feedback de éxito/error
- Formularios deben ser `w-full` en móvil

Crear formulario: $ARGUMENTS
