---
name: "Firestore Service Pattern"
version: "1.0"
scope: "firestore"
triggers: "Crear o modificar acceso a Firestore desde el frontend"
applies_to:
  - "frontend/src/features/**/services/*.ts"
  - "frontend/src/features/**/hooks/*.ts"
last_updated: "2026-02-07"
---

# Firestore Service Pattern

## Objetivo
Garantizar que todo acceso a Firestore pase por el service layer, manteniendo componentes y hooks libres de imports directos de Firebase.

## Do
- Seguir el flujo: `UI Component → Custom Hook → Feature Service → Firebase SDK / Callable`
- Crear services en `frontend/src/features/<feature>/services/`
- Importar `db` y `app` desde `@/lib/firebase`
- Importar tipos desde `@/types/db-schema`
- Tipar payloads de entrada y retornos explícitamente (ver AGENTS.md §TypeScript Rules)
- Usar `httpsCallable<TRequest, TResponse>()` con generics para callable functions
- Normalizar datos de Firestore con type guards (ver ejemplo abajo)
- Exponer listeners con firma `(onChange, onError?) => Unsubscribe`

## Don't
- Importar `collection`, `doc`, `onSnapshot`, etc. en componentes o hooks
- Usar `any` en payloads o respuestas; usar `unknown` y narrow
- Acoplar lógica de UI al shape de Firestore (el service normaliza)
- Crear services en `src/lib/` o `src/services/` (vive en el feature)

## Flujo recomendado
1. Definir payload types en el service file (derivar de `db-schema` cuando sea posible)
2. Crear type guards / normalizers para datos que vienen de Firestore
3. Crear funciones del service: listeners (`listen*`) y mutations (`create*`, `update*`, `delete*`)
4. Crear custom hook en `features/<feature>/hooks/` que consuma el service
5. El componente solo usa el hook

## Template / Checklist

Estructura mínima de un service:

```ts
// frontend/src/features/<feature>/services/<feature-entity>.ts
import { collection, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

import { app, db } from "@/lib/firebase"
import type { MyType } from "@/types/db-schema"

// 1. Payload types
export type MyPayload = { /* ... */ }

// 2. Type guards / normalizers
const normalize = (data: unknown): MyType | null => { /* narrow & validate */ }

// 3. Listener
export const listenMyEntities = (
  onChange: (items: MyType[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  return onSnapshot(
    collection(db, "my_collection"),
    (snapshot) => {
      const items = snapshot.docs.map((d) => normalize(d.data())).filter(Boolean) as MyType[]
      onChange(items)
    },
    (error) => onError?.(error),
  )
}

// 4. Mutation via callable
const functions = getFunctions(app)
const myCallable = httpsCallable<MyPayload, { status: string }>(functions, "myFunction")

export const createMyEntity = async (payload: MyPayload): Promise<void> => {
  await myCallable(payload)
}
```

- [ ] Service en `features/<feature>/services/`
- [ ] Imports de Firebase solo en el service (no en hooks/components)
- [ ] Payload types definidos y exportados
- [ ] Type guards para datos de Firestore
- [ ] Callable tipado con generics
- [ ] Hook consume service, componente consume hook

## Edge cases
- **Listeners con cleanup:** siempre retornar `Unsubscribe` y llamarlo en el cleanup del `useEffect`
- **Errores de callable:** el service puede re-lanzar o dejar que el hook maneje el `FirebaseError`
- **Datos legacy sin campos nuevos:** el normalizer debe manejar campos opcionales con defaults

## Referencias internas
- `AGENTS.md` §Firebase and Data Access (regla: nunca acceder Firestore desde UI)
- `frontend/src/features/settings/services/system-categories.ts` (ejemplo real: listener + callables)
- `frontend/src/features/settings/services/userPreferences.ts` (ejemplo real: listener + update directo)
- `frontend/src/lib/firebase.ts` (exports: `db`, `app`, `auth`)
