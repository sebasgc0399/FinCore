---
paths:
  - "functions/**"
---

# Reglas Cloud Functions

## Arquitectura
- Todas las funciones son callable (`onCall` de `firebase-functions/v2/https`); sin HTTP triggers.
- Entry point único: `functions/src/index.ts`.
- Seed data: `functions/src/data/`.
- Runtime: verificar campo `engines` en `functions/package.json`.

## Patrón Admin Claim
- Cada función debe llamar `requireAdmin(request.auth)` como primera operación.
- Valida `request.auth.token.admin === true`.
- Lanza `HttpsError("permission-denied")` si falla.

## Validación de Request
- Parsear `request.data` con helpers de validación existentes en `index.ts` (ej: `getRecord`, `getRequiredString`).
- Si no existen helpers para el tipo necesario, crearlos siguiendo el patrón existente.
- Nunca confiar en `request.data` directamente; validar y narrow cada campo.
- Retornar respuestas estructuradas: `{ status: "created" | "updated" | "deleted" | ... }`.

## Errores
- Usar `HttpsError` con códigos apropiados: `permission-denied`, `invalid-argument`, `already-exists`, `not-found`.
- No exponer detalles internos en mensajes de error.

## Escrituras Firestore
- Usar batch writes para operaciones multi-documento.
- Usar server timestamps donde aplique.
- Validar existencia del documento antes de updates/deletes.
