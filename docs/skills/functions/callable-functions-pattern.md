---
name: "Callable Functions Pattern"
version: "1.1"
scope: "functions"
triggers: "Crear o modificar Cloud Functions callable"
applies_to:
  - "functions/src/**/*.ts"
last_updated: "2026-02-07"
---

# Callable Functions Pattern

## Objetivo
Patrón estándar para crear Cloud Functions callable (`onCall` v2) con validación estricta, admin claims y respuestas estructuradas.

## Do
- Exportar funciones desde `functions/src/index.ts` (entry point único de exports)
- Implementación puede vivir en módulos separados para evitar monolito; `index.ts` re-exporta
- Usar `onCall` de `firebase-functions/v2/https`
- Llamar `requireAdmin(request.auth)` como primera operación
- Parsear `request.data` con helpers de validación existentes (`getRecord`, `getRequiredString`, etc.)
- Retornar respuestas estructuradas: `{ status: "created" | "updated" | "deleted" | ... }`
- Usar `HttpsError` con códigos apropiados
- Usar batch writes para operaciones multi-documento

## Don't
- Crear HTTP triggers (`onRequest`); solo callable
- Confiar en `request.data` sin validar; siempre narrow cada campo
- Exponer detalles internos en mensajes de error
- Usar `any` en tipos de request/response
- Hardcodear valores que puedan cambiar (verificar `functions/package.json` para runtime)

## Flujo recomendado
1. Definir tipos TypeScript para payload y respuesta
2. Crear helpers de validación si no existen para el tipo necesario (seguir patrón existente)
3. Implementar la función: `requireAdmin` → validar → operar → retornar status
4. Exportar desde `index.ts`
5. Crear wrapper tipado en el frontend service con `httpsCallable<TReq, TRes>`

## Template / Checklist

Estructura mínima de una callable function:

```ts
// functions/src/index.ts (o módulo re-exportado desde index.ts)
// Nota: db usa Admin SDK (getFirestore de firebase-admin/firestore),
// inicializado con initializeApp() en index.ts.

type MyPayload = { id: string; name: string }

export const myFunction = onCall(async (request) => {
  requireAdmin(request.auth)

  const record = getRecord(request.data)
  const id = getRequiredString(record.id, "id")
  const name = getRequiredString(record.name, "name")

  const docRef = db.collection("my_collection").doc(id)
  await docRef.set({ name })

  return { status: "created" }
})
```

- [ ] Exportada desde `functions/src/index.ts`
- [ ] `requireAdmin(request.auth)` como primera línea
- [ ] `request.data` parseado con helpers (no acceso directo)
- [ ] `HttpsError` con código semántico para cada error
- [ ] Respuesta `{ status: "..." }`
- [ ] Frontend: wrapper tipado con `httpsCallable<Payload, Response>(functions, "name")`
- [ ] Frontend: service function que llama al wrapper y es consumida por hook

## Edge cases
- **Verificar existencia antes de update/delete:** usar `.get()` y lanzar `not-found` si no existe
- **Idempotencia en create:** verificar `already-exists` antes de `.set()`
- **Batch writes > 500 docs:** Firestore limita batches a 500; dividir si es necesario
- **Nuevos helpers:** si no existe un helper, crearlo siguiendo el patrón existente en `index.ts`

## Referencias internas
- `AGENTS.md` §Firebase and Data Access
- `functions/src/index.ts` (implementaciones actuales + helpers + Admin SDK init)
- `functions/AGENTS.md` (overview del subsistema)
- `docs/skills/firestore/firestore-service-pattern.md` (lado frontend del callable)
