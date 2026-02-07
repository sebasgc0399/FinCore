# FinCore Workflow (Multi-IA)

Este archivo describe el proceso recomendado. La autoridad final y reglas obligatorias están en `AGENTS.md`.

## Plan → Build → Audit

### 1) Brief (Sebas)
Incluye:
- Objetivo
- Scope: in / out
- Restricciones (si aplica)
- Qué significa "hecho"

### 2) Plan (ChatGPT lidera; Claude apoya si es sensible)
Entregables del plan:
- Decisiones y trade-offs (2–3 opciones si aplica)
- Checklist de implementación (pasos concretos)
- Criterios de aceptación (checklist verificable)
- Riesgos / edge cases

### 3) Approval Gate (Sebas)
Obligatorio antes de "alto impacto" (ver AGENTS).

### 4) Build (Codex)
Reglas:
- Mantener cambios acotados al scope.
- Seguir feature-first + service layer.
- No introducir dependencias nuevas sin aprobación.
- Validar antes de entregar:
  - `cd frontend && npm run lint && npm run build`
  - `cd functions && npm run lint && npm run build`

### 5) Audit (Claude)
Checklist de auditoría:
- Tipado estricto (sin any), coherencia de imports y naming
- Seguridad: rules/functions alineadas con contrato (Zod) y ownership
- UX: loading/empty/error básicos donde aplique
- Accesibilidad: labels, foco, keyboard, touch targets (>=44px)
- i18n: sin hardcode, claves en ambos idiomas
- No hay refactors masivos "gratis"

### 6) Close (Sebas)
Decide merge / ajustes.

---

## Mini-RFC Template (High Impact)

**Title:**
**Problem:**
**Proposal:**
**Alternatives:**
**Trade-offs:**
**Validation plan:**

---

## Handoff Templates

### Handoff → Codex (Implementation)
- **Task:**
- **Scope (in):**
- **Scope (out):**
- **Acceptance criteria:**
- **Suggested files:**
- **Validation commands:**

### Handoff → Claude (Audit)
- **What changed:**
- **Flows affected:**
- **Where it could break:**
- **High-risk areas to review:**
- **Audit checklist focus:**

---

## Skills (Playbooks)

Skill library en `docs/skills/`. Son playbooks accionables para tareas recurrentes.

### Regla
Si una tarea toca Firestore, auth, i18n, Cloud Functions o patrones de UI, el Plan/Handoff/Audit **debe listar las skills aplicables** con sus rutas.

### Ejemplo en un handoff
```
**Skills aplicables:**
- `docs/skills/firestore/firestore-service-pattern.md`
- `docs/skills/frontend/i18n-keys-workflow.md`
```

### Skills disponibles
| Skill | Ruta |
|-------|------|
| Firestore Service Pattern | `docs/skills/firestore/firestore-service-pattern.md` |
| Zod Contract Evolution | `docs/skills/firestore/zod-contract-evolution.md` |
| Callable Functions Pattern | `docs/skills/functions/callable-functions-pattern.md` |
| i18n Keys Workflow | `docs/skills/frontend/i18n-keys-workflow.md` |
| ModalShell Usage | `docs/skills/ux/modal-shell-usage.md` |

Ver `docs/skills/README.md` para índice completo y guía de uso.
