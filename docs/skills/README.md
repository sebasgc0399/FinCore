# FinCore Skill Library

Playbooks modulares y accionables para tareas recurrentes.
Las skills NO reemplazan `AGENTS.md` (constitución) ni `WORKFLOW.md` (proceso); los complementan.

## Cuándo usar una skill

- **Plan/Handoff:** listar las skills aplicables para que el ejecutor las consulte.
- **Build:** abrir la skill como checklist antes de implementar.
- **Audit:** verificar que el diff cumpla los "Do" y no viole los "Don't".

## Cómo elegir skill (por trigger)

| Si la tarea toca... | Skill |
|----------------------|-------|
| Acceso a Firestore desde frontend | `firestore/firestore-service-pattern.md` |
| Campos, enums o colecciones en `db-schema.ts` | `firestore/zod-contract-evolution.md` |
| Cloud Functions callable | `functions/callable-functions-pattern.md` |
| Texto visible al usuario / claves i18n | `frontend/i18n-keys-workflow.md` |
| Modales, drawers o formularios en overlay | `ux/modal-shell-usage.md` |

## Índice

> Rutas relativas a `docs/skills/`.

### Firestore
| Skill | Archivo |
|-------|---------|
| Service Pattern | `firestore/firestore-service-pattern.md` |
| Zod Contract Evolution | `firestore/zod-contract-evolution.md` |

### Functions
| Skill | Archivo |
|-------|---------|
| Callable Functions Pattern | `functions/callable-functions-pattern.md` |

### Frontend
| Skill | Archivo |
|-------|---------|
| i18n Keys Workflow | `frontend/i18n-keys-workflow.md` |

### UX
| Skill | Archivo |
|-------|---------|
| ModalShell Usage | `ux/modal-shell-usage.md` |

## Cómo crear una nueva skill

1. Copiar `_template.md` al subdirectorio apropiado.
2. Rellenar frontmatter y secciones.
3. Mantener < 120 líneas.
4. Agregar entrada al índice y a la tabla de triggers.
5. No duplicar reglas de `AGENTS.md`; referenciar la sección relevante.

## Cómo referenciar en handoffs

En un handoff o plan, agregar una línea:

```
**Skills aplicables:** `docs/skills/firestore/firestore-service-pattern.md`, `docs/skills/frontend/i18n-keys-workflow.md`
```
