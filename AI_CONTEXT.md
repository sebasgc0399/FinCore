# AI Context Index — FinCore

> **Qué es:** índice de orientación rápida para cualquier IA que trabaje en FinCore.
> **Qué NO es:** no reemplaza `AGENTS.md` (reglas), `README.md` (docs completas)
> ni `WORKFLOW.md` (proceso). No dupliques info de esos docs aquí.

## Precedencia de fuentes

1. `AGENTS.md` — constitución (reglas obligatorias, pilares, convenciones)
2. `frontend/src/types/db-schema.ts` + `firestore.rules` — contrato canónico y seguridad (si hay conflicto, mandan aquí)
3. `README.md` — documentación técnica completa (arquitectura, setup, deploy, FAQ)
4. `WORKFLOW.md` — proceso multi-IA, handoff templates, mini-RFC
5. Este archivo — solo orientación rápida, status y template de briefing

---

## Links rápidos

| Doc / Archivo | Propósito |
|---|---|
| `AGENTS.md` | Reglas de código, TypeScript, React, imports, naming |
| `WORKFLOW.md` | Plan → Build → Audit, handoff templates, mini-RFC |
| `README.md` | Setup, quickstart, scripts, deploy, contratos, FAQ |
| `frontend/src/types/db-schema.ts` | Contratos Zod canónicos (Doc/Input/Entity) |
| `firestore.rules` | Seguridad, ownership, validación de documentos |
| `frontend/AGENTS.md` | Subsistema frontend: composición, archivos clave, features |
| `functions/AGENTS.md` | Subsistema functions: callable exports, patrón admin |
| `docs/skills/README.md` | Índice de playbooks (Firestore, i18n, functions, ModalShell) |

---

## Runtime map

```
main.tsx → App.tsx → ThemeProvider → AuthProvider → AppRouter
  → ProtectedRoute → AppShell (bottom nav + FAB) → Pages
  → PublicRoute → /login
```

Flujo de datos:
```
UI components → feature hooks → feature services → Firebase SDK / Callable Functions (admin-only)
```

Archivos clave de infraestructura:
- Firebase init: `frontend/src/lib/firebase.ts` (incluye `resolveAuthDomain`)
- Auth bootstrap: `frontend/src/features/auth/services/userBootstrap.ts`
- i18n config: `frontend/src/lib/i18n.ts`
- Formatters: `frontend/src/lib/formatters.ts`

---

## Development status

### Features

> Regla: mantener esta sección corta (max 12 filas). No listar subtareas ni archivos por feature.

| Feature | Estado | Nota |
|---|---|---|
| Google sign-in (popup) + sign-out | ✅ | |
| User bootstrap (user doc + default categories) | ✅ | |
| Theme + language sync desde Firestore | ✅ | |
| Settings: admin CRUD/reorder system categories | ✅ | via callable functions |
| ModalShell (Drawer mobile / Dialog desktop) | ✅ | |
| TransactionSheet (captura de gasto/ingreso) | 🟡 | UI completa, save mockeado (no persiste) |
| Dashboard | 🟡 | Muestra saludo + sign-out; sin datos reales |
| Home, Movimientos, Objetivos, Métricas, Asesor | ❌ | Placeholder ("En construcción") |
| Tests (unit / integration) | ❌ | Sin test runner configurado |

### Gaps conocidos

- **i18n detection:** posible desalineación entre preferencia persistida y detección local (ver skill de i18n).
- **i18n coverage:** algunos placeholders aún tienen texto hardcoded.
- **Recurrence UI:** el selector UI no expone todas las opciones definidas en el schema.

---

## AI briefing template

Copiar y adaptar para cada tarea:

```md
## Task
<qué construir/arreglar>

## Context
<por qué / qué está pasando>

## Scope
- In: <archivos/features permitidos>
- Out: <qué no tocar>

## Acceptance criteria
1. <requisito funcional>
2. <requisito UX>
3. lint + build pasan en ambos workspaces

## Risks / edge cases
- <1–3 bullets>

## Skills aplicables
- <ruta a skill relevante de docs/skills/>
```

Constraints y validation commands ya están en `AGENTS.md` y `README.md`; no repetirlos aquí.

---

**Last updated:** 2026-02-08

> Si esta fecha tiene más de 14 días, verifica status y gaps contra el código actual
> antes de confiar en esta sección. Los links y el runtime map son estables.
