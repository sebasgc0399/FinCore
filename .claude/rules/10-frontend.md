---
paths:
  - "frontend/**"
---

# Reglas Frontend (complementa AGENTS.md)

Las reglas de componentes, estado, styling, shadcn/ui, accesibilidad y performance
están en `AGENTS.md`. Este archivo solo agrega patrones operativos del frontend.

## Flujo de Datos (nunca saltar el service layer)
```
UI Component → Custom Hook (useXxx) → Feature Service → Firebase SDK / Callable Functions
```
- Nunca importar Firestore en componentes o hooks directamente.
- Todo acceso Firestore pasa por `features/<feature>/services/`.

## Feature-First
- Estructura: `src/features/<feature>/` con `components/`, `hooks/`, `services/`, `types/`.
- Crear barrel `index.ts` solo si el feature es importado por otros features.

## Modales
- Usar `ModalShell` para todos los modales estándar (Drawer en mobile, Dialog en desktop).
- Solo bypass con razón documentada en código.

## Helpers de proyecto
- Clases condicionales: `cn()` de `@/lib/utils`.
- Firebase init: `src/lib/firebase.ts` (incluye `resolveAuthDomain` para iOS Safari).
