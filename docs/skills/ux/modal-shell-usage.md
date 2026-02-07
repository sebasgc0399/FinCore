---
name: "ModalShell Usage"
version: "1.1"
scope: "ux"
triggers: "Crear modal, drawer, dialog, o formulario en overlay"
applies_to:
  - "frontend/src/features/**/components/*.tsx"
  - "frontend/src/components/**/*.tsx"
last_updated: "2026-02-07"
---

# ModalShell Usage

## Objetivo
Usar `ModalShell` como wrapper estándar para modales, garantizando UX consistente: Drawer en mobile, Dialog en desktop, con accesibilidad y responsive behavior.

## Do
- Usar `ModalShell` para todo modal estándar (ver AGENTS.md §Modals and Sheets)
- Proveer `title` (siempre) y `description` (cuando aporte contexto)
- Usar `footer` prop para botones de acción (no meterlos en `children`)
- Configurar `snapPoints` del Drawer si el contenido tiene altura variable
- Asegurar touch targets >= 44px en botones dentro del modal
- Bloquear cierre durante submit async (ver Edge cases)

## Don't
- Crear modales custom con `Dialog`/`Drawer` directamente (sin bypass documentado)
- Omitir `title` (requerido para accesibilidad)
- Poner scroll infinito dentro de un modal; preferir paginación o filtros
- Hardcodear texto en el modal (usar i18n)

## Flujo recomendado
1. Importar `ModalShell` desde `@/components/common/ModalShell`
2. Manejar estado `open` / `onOpenChange` en el componente padre o hook
3. Pasar `title`, `children` (contenido), y opcionalmente `footer` y `description`
4. Si el contenido es largo en mobile: configurar `snapPoints`
5. Verificar en viewport mobile (< 640px) que el Drawer se comporte correctamente

## Template / Checklist

```tsx
import { ModalShell } from "@/components/common/ModalShell"

const MyModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={t("myModal.title")}
      description={t("myModal.description")}
      footer={
        <Button onClick={handleSave} className="w-full min-h-[44px]">
          {t("common:save")}
        </Button>
      }
    >
      {/* Contenido del modal */}
    </ModalShell>
  )
}
```

- [ ] Usa `ModalShell` (no Dialog/Drawer directo)
- [ ] `title` provisto (accesibilidad)
- [ ] Texto usa `t()` (no hardcoded)
- [ ] Botones de acción en `footer` prop
- [ ] Touch targets >= 44px en botones
- [ ] Probado en viewport mobile (< 640px)
- [ ] Si bypass: razón documentada en comentario de código

## Edge cases
- **Cierre durante submit async:** guardar estado `submitting` y en `onOpenChange` ignorar cierre si `submitting === true`, o pedir confirmación al usuario
- **Focus management:** ModalShell auto-focus al primer elemento interactivo en desktop; en mobile el Drawer maneja el foco
- **Nested modals:** evitar; si es necesario, el segundo modal debe cerrar el primero
- **Forms con cambios no guardados:** interceptar `onOpenChange` para confirmar descarte

## Props disponibles

> **Anti-drift:** esta tabla debe verificarse contra `ModalShell.tsx` si hay dudas.

| Prop | Tipo | Req | Descripción |
|------|------|-----|-------------|
| `open` | `boolean` | si | Estado del modal |
| `onOpenChange` | `(open: boolean) => void` | si | Callback apertura/cierre |
| `title` | `ReactNode` | si | Título del modal |
| `description` | `string` | no | Descripción (subtitle) |
| `children` | `ReactNode` | si | Contenido |
| `footer` | `ReactNode` | no | Botones de acción |
| `snapPoints` | `Array<number \| string>` | no | Snap points (solo mobile) |
| `activeSnapPoint` | `number \| string` | no | Snap point activo |
| `closeThreshold` | `number` | no | Umbral para cerrar |
| `setActiveSnapPoint` | `(sp: number \| string \| null) => void` | no | Callback snap point |
| `contentClassName` | `string` | no | Clase CSS contenido |

## Referencias internas
- `AGENTS.md` §Modals and Sheets, §Styling and UI (touch targets, mobile-first)
- `frontend/src/components/common/ModalShell.tsx` (implementación, fuente de verdad para props)
- `frontend/src/hooks/useMediaQuery.ts` (breakpoint: 640px)
