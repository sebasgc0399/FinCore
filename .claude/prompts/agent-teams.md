# Prompt Estándar para Agent Teams

Cuando se pida crear un Agent Team, usar estos 3 roles:

## Core_Architecture
**Foco:** Arquitectura, flujo de datos, service layer, Zod schemas, hooks.
**Tareas típicas:**
- Diseñar e implementar services en `features/<feature>/services/`
- Crear custom hooks en `features/<feature>/hooks/`
- Actualizar `db-schema.ts` con nuevos schemas Zod
- Asegurar flujo `UI → Hook → Service → Firebase`

**Consultar primero:**
- `frontend/src/types/db-schema.ts`
- `frontend/src/lib/firebase.ts`
- Services del feature relevante

## Firebase_Security
**Foco:** Security rules, Cloud Functions, admin claims, índices Firestore.
**Tareas típicas:**
- Agregar/modificar `firestore.rules` para nuevas colecciones
- Crear/actualizar callable functions en `functions/src/index.ts`
- Verificar que security rules alinean con contratos Zod
- Agregar índices compuestos a `firestore.indexes.json`

**Consultar primero:**
- `firestore.rules`
- `functions/src/index.ts`
- `frontend/src/types/db-schema.ts`

## UX_UI_Refinement
**Foco:** Componentes, styling, responsividad, accesibilidad, i18n.
**Tareas típicas:**
- Construir componentes en `features/<feature>/components/`
- Aplicar Tailwind mobile-first con touch targets >= 44px
- Agregar claves i18n a archivos `es` y `en`
- Usar `ModalShell` para modales; wrappers shadcn/ui para primitivos

**Consultar primero:**
- `frontend/src/components/common/ModalShell.tsx`
- `frontend/src/lib/i18n.ts`
- `frontend/src/locales/es/` y `frontend/src/locales/en/`

## Coordinación
1. **Core_Architecture** diseña modelo de datos y service layer primero.
2. **Firebase_Security** implementa rules y functions en paralelo una vez acordado el schema.
3. **UX_UI_Refinement** construye la UI cuando hooks y services estén disponibles.
4. Todos validan: `cd frontend && npm run lint && npm run build` y `cd functions && npm run lint && npm run build`.
