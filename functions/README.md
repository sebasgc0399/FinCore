# FinCore Cloud Functions

Workspace de Cloud Functions para FinCore. Contiene **todas** las funciones serverless del proyecto: callable functions que gestionan operaciones privilegiadas sobre Firestore que el cliente no puede (ni debe) ejecutar directamente.

> Para contexto general del proyecto (arquitectura, contratos de datos, setup, deploy):
> ver el [README raíz](../README.md).

---

## Alcance actual

Hoy este workspace gestiona exclusivamente la colección `system_categories` (categorías globales del sistema). Todas las funciones son **callable** (`onCall` v2) y requieren **admin custom claim** en el token de autenticación. No existen HTTP triggers ni scheduled functions.

El frontend invoca estas funciones a través del SDK de Firebase (`httpsCallable`) desde el service layer del feature `settings`.

---

## Stack

| Tecnología | Detalle |
|---|---|
| Runtime | Node.js (ver `engines.node` en `functions/package.json`) |
| Framework | Firebase Functions v2 (`onCall` de `firebase-functions/v2/https`) |
| Admin SDK | `firebase-admin` (Firestore, Auth) |
| Lenguaje | TypeScript strict (`strict: true` en `tsconfig.json`) |
| Linting | ESLint con `eslint-config-google` + `@typescript-eslint` |

Para versiones exactas de cada dependencia, ver `functions/package.json`.

---

## Estructura de carpetas

```
functions/
├── src/
│   ├── index.ts                    # Entry point: exports, helpers, tipos, inicialización
│   └── data/
│       └── systemCategories.ts     # Seed data (categorías default del sistema)
├── lib/                            # Output compilado (generado por tsc, cubierto por .gitignore)
├── package.json                    # Dependencias y scripts
├── tsconfig.json                   # Config TypeScript (ver archivo para target/module)
├── .eslintrc.js                    # Config ESLint
└── AGENTS.md                       # Instrucciones para IAs que trabajen en este subsistema
```

### Rol de cada archivo clave

- **`src/index.ts`** — Entry point único. Contiene:
  - Inicialización de Firebase Admin SDK (`initializeApp()`, `getFirestore()`)
  - Tipos locales (`CategoryKind`, `SystemCategoryPayload`, `SystemCategoryData`)
  - Helper `requireAdmin()` — valida el custom claim `admin` en el token
  - Helpers de validación de request (`getRecord`, `getRequiredString`, `getOptionalString`, `getRequiredKind`, `getRequiredOrder`, etc.)
  - Las 5 funciones callable exportadas (ver sección siguiente)

- **`src/data/systemCategories.ts`** — Array readonly con las categorías semilla del sistema. Cada entrada tiene: `id`, `labelKey` (clave i18n), `icon`, `kind`, `order`, y opcionalmente `color` y `parentId`.

---

## Funciones exportadas

> **Fuente de verdad:** `functions/src/index.ts` (types + validadores). Este README describe el contrato a alto nivel; ante discrepancia, el código manda.

Todas las funciones siguen el mismo patrón: `requireAdmin` → validar `request.data` → operar sobre Firestore → retornar `{ status: "..." }`.

### `seedSystemCategories`

| | |
|---|---|
| **Propósito** | Poblar la colección `system_categories` con las categorías iniciales definidas en `src/data/systemCategories.ts`. |
| **Input** | Ninguno (no usa `request.data`). |
| **Output** | `{ status: "seeded", count: number }` si la colección estaba vacía; `{ status: "skipped" }` si ya existían documentos. |
| **Restricción** | Admin claim requerido. Operación idempotente: solo escribe si la colección está vacía. Usa batch write. |

### `createSystemCategory`

| | |
|---|---|
| **Propósito** | Crear una nueva categoría de sistema. |
| **Input** | `{ id: string, labelKey: string, icon: string, kind: "expense" \| "income", order?: number, color?: string \| null, parentId?: string \| null }` |
| **Output** | `{ status: "created" }` |
| **Restricción** | Admin claim requerido. Si `order` no se envía, se auto-calcula como `max(order) + 1` del `kind` correspondiente. Lanza `already-exists` si el `id` ya existe. |

### `updateSystemCategory`

| | |
|---|---|
| **Propósito** | Actualizar una categoría de sistema existente. |
| **Input** | `{ id: string, labelKey: string, icon: string, kind: "expense" \| "income", order: number, color?: string \| null, parentId?: string \| null }` |
| **Output** | `{ status: "updated" }` |
| **Restricción** | Admin claim requerido. `order` es obligatorio (no se auto-calcula). |

### `deleteSystemCategory`

| | |
|---|---|
| **Propósito** | Eliminar una categoría de sistema por su `id`. |
| **Input** | `{ id: string }` |
| **Output** | `{ status: "deleted" }` |
| **Restricción** | Admin claim requerido. |

### `reorderSystemCategories`

| | |
|---|---|
| **Propósito** | Reordenar las categorías de un `kind` específico usando un array ordenado de IDs. |
| **Input** | `{ kind: "expense" \| "income", orderedIds: string[] }` |
| **Output** | `{ status: "reordered", count: number }` |
| **Restricción** | Admin claim requerido. Valida que todos los IDs existan y pertenezcan al `kind` indicado. Asigna `order: index` según la posición en el array. Usa batch write. No permite IDs duplicados. |

---

## Seguridad: relación con firestore.rules

Las Cloud Functions y las security rules trabajan en conjunto para proteger `system_categories`:

```
firestore.rules                          Cloud Functions (Admin SDK)
─────────────────                        ──────────────────────────
system_categories/{id}                   seedSystemCategories
  allow read:  if isSignedIn()           createSystemCategory
  allow write: if false  ← bloqueado    updateSystemCategory
                                         deleteSystemCategory
                                         reorderSystemCategories
```

**Principio:** el cliente puede *leer* `system_categories` (cualquier usuario autenticado), pero **nunca escribir**. Las escrituras solo ocurren server-side a través del Firebase Admin SDK, invocado por funciones callable que verifican el claim `admin` manualmente con `requireAdmin()`.

> El Admin SDK **no está sujeto a `firestore.rules`**; por eso el control de acceso real aquí es `requireAdmin()` + validación estricta del payload.

Otras colecciones relevantes en el modelo de seguridad:

- **`payments/{id}`** — `allow read` para owner o admin; `allow write: if false`. Reservada para escritura server-side futura.
- **Colecciones user-owned** (`users/{uid}/**`) — protegidas por `isOwner(uid)` en rules; las functions no las tocan actualmente.

Para el detalle completo de security rules, ver `firestore.rules` en la raíz del repo.

---

## Comandos

Todos los scripts están definidos en `functions/package.json`:

| Script | Comando | Descripción |
|---|---|---|
| `build` | `tsc` | Compila TypeScript → `lib/` |
| `build:watch` | `tsc --watch` | Compilación continua en modo watch |
| `lint` | `eslint --ext .js,.ts .` | Linting con ESLint |
| `serve` | `npm run build && firebase emulators:start --only functions` | Build + emulador local **solo de functions** (ver nota abajo) |
| `shell` | `npm run build && firebase functions:shell` | Shell interactivo para invocar functions (útil para debug local; revisar proyecto activo) |
| `deploy` | `firebase deploy --only functions` | Deploy directo a producción |
| `logs` | `firebase functions:log` | Ver logs de functions en la nube |

> **Nota sobre emuladores:** FinCore **no usa emuladores de Firestore, security rules ni Auth** como parte del workflow normal. El script `serve` levanta **solo el emulador de Cloud Functions** y es opcional (debug local). **Si no estás emulando Firestore, el Admin SDK puede terminar apuntando a un proyecto real** según tu configuración (`firebase use` / `--project`). Usa siempre un proyecto dev/preprod para pruebas y evita ejecutarlo contra producción.
>
> **Tip:** antes de correr `serve`, verifica el proyecto activo con `firebase use` o ejecuta siempre con `--project <devProjectId>`.

### Predeploy automático

`firebase.json` configura predeploy hooks para functions:

```json
"predeploy": [
  "npm --prefix \"$RESOURCE_DIR\" run lint",
  "npm --prefix \"$RESOURCE_DIR\" run build"
]
```

Esto garantiza que `firebase deploy --only functions` ejecuta lint + build automáticamente antes de subir código.

---

## Flujo típico de desarrollo y deploy

### Desarrollo

1. Editar el código en `functions/src/`.
2. Compilar y verificar:
   ```bash
   cd functions
   npm run lint && npm run build
   ```
3. Opciones para probar:

   **Opción A (recomendada):** Deploy y probar desde la UI (el frontend ya apunta al proyecto real).
   ```bash
   npm run deploy
   ```

   **Opción B (debug local):** Emulador solo de Functions.
   ```bash
   npm run serve
   ```
   Para invocar funciones locales: usar `npm run shell`, o configurar el frontend para usar `connectFunctionsEmulator` bajo un flag local (no está habilitado por defecto).

### Deploy

```bash
cd functions
npm run deploy
```

Esto ejecuta automáticamente lint + build (predeploy) y luego sube las functions a producción.

### Validación obligatoria (Definition of Done)

Antes de considerar cualquier cambio como terminado:

```bash
cd frontend && npm run lint && npm run build
cd functions && npm run lint && npm run build
```

Ambos workspaces deben pasar sin errores.

---

## Troubleshooting

### "Admin permissions required" (`permission-denied`)

**Causa:** el usuario que invoca la function no tiene el custom claim `admin: true` en su token de Auth.

**Solución:**
1. Verificar que el claim fue asignado correctamente desde la consola de Firebase → Authentication → Users → Custom claims, o mediante el Admin SDK.
2. El claim se lee del token: `request.auth.token.admin === true`. Si se acaba de asignar, el usuario debe cerrar sesión y volver a iniciarla para que el token se refresque.

### "Invalid payload" / "Invalid [field]" (`invalid-argument`)

**Causa:** `request.data` no tiene la estructura esperada o un campo no pasa la validación (string vacío, tipo incorrecto, etc.).

**Solución:** revisar el payload que envía el frontend. Comparar con los tipos documentados en la sección "Funciones exportadas" de este documento y con los helpers de validación en `src/index.ts`.

### "Category already exists" (`already-exists`)

**Causa:** `createSystemCategory` encontró un documento con el mismo `id`.

**Solución:** usar un `id` diferente, o usar `updateSystemCategory` si la intención es modificar.

### "Category not found" (`not-found`)

**Causa:** `reorderSystemCategories` recibió un `id` en `orderedIds` que no existe como documento en Firestore.

**Solución:** verificar que todos los IDs del array existen en `system_categories` y pertenecen al `kind` correcto.

### Deploy fallido

**Causas comunes:**
- **Lint errors:** el predeploy ejecuta lint antes de build. Corregir errores de ESLint primero.
- **Errores de TypeScript:** `tsc` con `strict: true`, `noImplicitReturns`, `noUnusedLocals`. Resolver warnings/errors del compilador.
- **Node version mismatch:** Firebase puede rechazar el deploy si el runtime solicitado no coincide con el configurado. Verificar `engines.node` en `package.json`.
- **Permisos de Firebase CLI:** asegurarse de estar autenticado (`firebase login`) y tener permisos de deploy en el proyecto.

### Logs vacíos o function no responde

- Verificar que la function fue deployada: `firebase functions:list` (o revisar en la consola de Firebase).
- Revisar logs: `npm run logs` o `firebase functions:log --only <functionName>`.
- Si se usó `serve`, recordar que el emulador local no persiste state ni emula rules.

---

## Links

| Recurso | Ruta |
|---|---|
| README raíz | [`../README.md`](../README.md) |
| AGENTS.md (constitución) | [`../AGENTS.md`](../AGENTS.md) |
| functions/AGENTS.md | [`./AGENTS.md`](./AGENTS.md) |
| Contratos de datos (Zod) | [`../frontend/src/types/db-schema.ts`](../frontend/src/types/db-schema.ts) |
| Security rules | [`../firestore.rules`](../firestore.rules) |
| Skill: Callable Functions Pattern | [`../docs/skills/functions/callable-functions-pattern.md`](../docs/skills/functions/callable-functions-pattern.md) |
| Skill: Zod Contract Evolution | [`../docs/skills/firestore/zod-contract-evolution.md`](../docs/skills/firestore/zod-contract-evolution.md) |
| Skill: Firestore Service Pattern | [`../docs/skills/firestore/firestore-service-pattern.md`](../docs/skills/firestore/firestore-service-pattern.md) |
| AI Context Index | [`../AI_CONTEXT.md`](../AI_CONTEXT.md) |

---

## Scope actual vs futuro

**Hoy:** las Cloud Functions gestionan exclusivamente el CRUD y reorder de `system_categories`. Todas son callable, todas requieren admin claim, y operan sobre una sola colección raíz.

**Próximos candidatos naturales** (sin compromiso de implementación):
- Escritura server-side de `payments` (la colección ya existe con `allow write: if false` en rules).
- Scripts/funciones one-off de backfill o mantenimiento cuando evolucione el data model (ver skill `zod-contract-evolution`).
- Functions para el asesor IA (feature `advisorChats`, actualmente placeholder).

La arquitectura (callable + admin claim + validación manual + Admin SDK) escala a cualquier colección que necesite escritura privilegiada. El patrón está documentado en `docs/skills/functions/callable-functions-pattern.md`.
