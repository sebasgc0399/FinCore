# FinCore Cloud Functions

Leer primero el `AGENTS.md` raíz (constitución del proyecto).

## Overview
Firebase Cloud Functions (v2). Runtime y scripts: ver `functions/package.json`.
Todas las funciones son callable (`onCall`); sin HTTP triggers.
Todas requieren admin custom claim (`request.auth.token.admin === true`).

## Funciones Callable Exportadas
| Función | Descripción |
|---------|-------------|
| `seedSystemCategories` | Seed de categorías iniciales (skip si colección no vacía) |
| `createSystemCategory` | Crear nueva categoría de sistema |
| `updateSystemCategory` | Actualizar categoría existente |
| `deleteSystemCategory` | Eliminar categoría por id |
| `reorderSystemCategories` | Reordenar categorías por kind (batch) |

Verificar lista actual en `functions/src/index.ts` (pueden haberse agregado más).

## Estructura de Archivos
- `functions/src/index.ts` — entry point único, todas las exports aquí
- `functions/src/data/systemCategories.ts` — seed data (categorías default)

## Patrón Admin Claim
Cada función inicia con: `requireAdmin(request.auth)`
Valida `request.auth.token.admin === true` y lanza `HttpsError("permission-denied")` si no.

## Validación de Request
Helpers de validación definidos en `index.ts`. Verificar cuáles existen antes de asumir.
Nunca confiar en shapes de `request.data` directamente.

## Comandos
Verificar scripts disponibles en `functions/package.json`. Los habituales:

```bash
npm run build     # Compilar TS
npm run lint      # ESLint
npm run serve     # Build + Firebase emulators (solo functions)
npm run deploy    # Deploy a producción
```
