# CLAUDE.md

## Jerarquía de documentos

1. **`AGENTS.md` es la constitución del proyecto. Síguelo exactamente.**
2. `AI_CONTEXT.md` es el índice de contexto rápido (status, gaps, links, briefing template).
3. `.claude/rules/` contiene reglas contextuales cargadas automáticamente por ruta.

## Orden de lectura recomendado

1. `AGENTS.md` — reglas y pilares de arquitectura
2. `AI_CONTEXT.md` — índice de contexto, status y gaps
3. `frontend/src/types/db-schema.ts` — contratos Zod canónicos
4. `firestore.rules` — restricciones de seguridad
5. Archivos del feature relacionado con la tarea asignada

## Workspace

| Directorio / Archivo      | Descripción                                    |
|---------------------------|------------------------------------------------|
| `frontend/`               | Web app (React 19 + Vite + TS + Tailwind)      |
| `functions/`              | Cloud Functions (callable, admin-only)          |
| `firestore.rules`         | Reglas de seguridad Firestore                   |
| `firestore.indexes.json`  | Índices compuestos                              |
| `WORKFLOW.md`             | Proceso multi-IA, templates de handoff           |
| `.claude/rules/`          | Reglas contextuales (cargadas por path)         |

Ver `frontend/AGENTS.md` y `functions/AGENTS.md` para detalles de cada subsistema.

## Comandos

### Frontend (`cd frontend`)

```bash
npm run dev       # Vite dev server con HMR
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview producción
```

### Cloud Functions (`cd functions`)

```bash
npm run build     # Compilar TypeScript
npm run lint      # ESLint
npm run serve     # Build + Firebase emulators (solo functions)
npm run deploy    # Deploy a producción
```

### Validación (ejecutar ambos antes de entregar)

```bash
cd frontend && npm run lint && npm run build
cd functions && npm run lint && npm run build
```

## Cambios de alto impacto

La política está definida en `AGENTS.md` (sección "High-Impact Changes").
Resumen: mini-RFC + aprobación de Sebas. Template en `WORKFLOW.md`.

## Reglas contextuales (.claude/rules/)

| Archivo                    | Carga cuando...                                    |
|----------------------------|----------------------------------------------------|
| `00-core.md`               | Siempre (guardrails operativos)                    |
| `10-frontend.md`           | Se trabaja en `frontend/**`                        |
| `20-functions.md`          | Se trabaja en `functions/**`                       |
| `30-firestore-security.md` | Se trabaja en `firestore.rules` o `functions/**`   |
| `40-i18n.md`               | Se trabaja en `frontend/**`                        |

## Agent Teams

Para crear un Agent Team con roles especializados, ver `.claude/prompts/agent-teams.md`.
