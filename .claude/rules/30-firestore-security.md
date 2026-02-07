---
paths:
  - "firestore.rules"
  - "firestore.indexes.json"
  - "functions/**"
---

# Firestore: Modelo y Seguridad

## Contrato Canonico
- Todos los tipos de documento estan definidos como Zod schemas en `frontend/src/types/db-schema.ts`.
- Al agregar o modificar colecciones: actualizar `db-schema.ts` PRIMERO, luego alinear security rules y validacion de functions.

## Enums Clave (verificar en db-schema.ts, esta lista puede estar desactualizada)
- Transaction type: `expense | income`
- Payment method: `cash | debit | credit | digital | other`
- Currency: `COP | USD`
- Language: `es | en`
- User role: `admin | free | paid_byok | paid_managed | gifted_managed`
- Template frequency: `weekly | biweekly | monthly | yearly`
- Objective type/status: `goal | debt`, `active | completed | archived`

## Colecciones Principales
- `system_categories/{id}` — read: signed-in; write: solo Cloud Functions.
- `users/{uid}` — owner read/write con restricciones de campos.
  - `users/{uid}/custom_categories/{id}` — owner CRUD.
- `transactions/{id}` — `userId == auth.uid` en todas las operaciones.
- `templates/{id}`, `budgets/{id}`, `objectives/{id}` — mismo patron de ownership.
- `usage/{uid}`, `payments/{id}` — read: owner o admin; write: bloqueado desde cliente.
- Catch-all `/{document=**}` — deny all (red de seguridad).

## Patrones de Security Rules
- Helpers: `isSignedIn()`, `isOwner(uid)`, `isAdmin()`.
- Crear: `userId == request.auth.uid` obligatorio.
- Update: `userId` no puede cambiar; campos auth del user doc inmutables desde cliente.
- Nuevos match blocks deben ir ARRIBA del catch-all deny.

## Al Modificar Security Rules
- Verificar que la regla coincida con el contrato Zod.
- Asegurar que el catch-all deny-all no override accidentalmente.
