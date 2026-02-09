# FinCore

App de finanzas personales, mobile-first, construida con React + Firebase.
Permite registrar gastos e ingresos, gestionar presupuestos, objetivos de ahorro/deuda,
y (próximamente) recibir insights de un asesor IA.

**Estado actual:** pre-producción. El modelo de Firestore usa ownership por path
`users/{uid}/...` y valida estructura/colecciones según `firestore.rules`.
Las páginas principales (Home, Movimientos, Objetivos, Métricas, Asesor) están en
scaffold/placeholder; la captura de transacciones existe como UI pero aún no persiste.

---

## Arquitectura y estructura del repo

```
FinCore/
├── frontend/                # Web app (React 19 + Vite + TS + Tailwind)
│   └── src/
│       ├── app/             # Shell, providers, router, layouts, pages
│       ├── components/      # Componentes compartidos (ui/, common/, ThemeToggle/)
│       ├── features/        # Módulos por dominio (auth, expenses, settings)
│       │   └── <feature>/
│       │       ├── components/
│       │       ├── hooks/
│       │       ├── services/
│       │       └── types/
│       ├── hooks/           # Hooks globales reutilizables
│       ├── lib/             # Firebase init, formatters, i18n, utils
│       ├── locales/         # Traducciones (es/, en/) por namespace
│       ├── styles/          # Tokens Tailwind, estilos globales
│       ├── types/           # Tipos compartidos (incluye db-schema.ts)
│       └── assets/          # Archivos estáticos
│
├── functions/               # Cloud Functions (callable, admin-only)
│   └── src/
│       ├── index.ts         # Exports: seed, CRUD y reorder de system_categories
│       └── data/            # Datos semilla (systemCategories)
│
├── docs/
│   └── skills/              # Playbooks accionables por dominio
│       ├── firestore/       # firestore-service-pattern, zod-contract-evolution
│       ├── functions/       # callable-functions-pattern
│       ├── frontend/        # i18n-keys-workflow
│       └── ux/              # modal-shell-usage
│
├── firestore.rules          # Reglas de seguridad Firestore
├── firestore.indexes.json   # Índices compuestos
├── firebase.json            # Config Firebase (hosting, functions, firestore)
│
├── AGENTS.md                # Constitución del proyecto (reglas obligatorias)
├── AI_CONTEXT.md            # Estado actual de desarrollo y gaps conocidos
├── WORKFLOW.md              # Proceso multi-IA (Plan → Build → Audit)
└── .claude/                 # Instrucciones y reglas para Claude Code
    ├── CLAUDE.md
    ├── rules/               # Reglas contextuales auto-cargadas por path
    └── prompts/             # Prompts adicionales (agent-teams, etc.)
```

### Relación frontend ↔ functions

- **Frontend** nunca accede a Firestore directamente desde componentes UI.
  El flujo es: `UI → hooks → services → Firebase SDK`.
- **Cloud Functions** son callable y requieren claim `admin`. Se usan para
  operaciones que el cliente no puede hacer (ej: CRUD de `system_categories`,
  cuyos writes están bloqueados desde el cliente en `firestore.rules`).
- Ambos comparten el contrato de datos definido en `frontend/src/types/db-schema.ts`
  como fuente de verdad de esquema.

---

## Requisitos y setup

### Versiones

| Herramienta    | Versión requerida / recomendada                                       |
|----------------|------------------------------------------------------------------------|
| Node.js        | **24** (ver `engines.node` en `functions/package.json`)                |
| npm            | El que viene con Node 24                                               |
| Firebase CLI   | Última versión estable (`npm i -g firebase-tools`)                     |
| TypeScript     | Instalado como devDep en cada workspace (ver `package.json` de cada uno) |

### Configuración de Firebase

El proyecto apunta a un proyecto Firebase real (no emuladores para el flujo normal).
La configuración web del proyecto Firebase (apiKey, projectId, authDomain, etc.) vive
en `frontend/src/lib/firebase.ts`. Estas son claves **públicas** del SDK web de Firebase
(diseñadas para estar en el cliente); la seguridad real la dan `firestore.rules` y
los claims de auth. Los secretos privados (service accounts, admin keys) **nunca**
deben estar en el repo.

> **Emuladores:** el flujo estándar de desarrollo apunta directamente a Firebase.
> El script `npm run serve` en `functions/` levanta un emulador **solo de Cloud Functions**
> para pruebas locales aisladas, pero no es parte del workflow diario.

### Variables de entorno / secretos

No hay archivos `.env` configurados actualmente. Si en el futuro se necesitan,
se documentarán aquí. **Nunca** commitear secretos, service accounts o claves
privadas al repo.

---

## Quickstart

### 1. Clonar e instalar

```bash
# Root (opcional): solo si el root package.json se usa para tooling compartido.
# El flujo normal es instalar en frontend/ y functions/.
npm install

# Frontend
cd frontend
npm install

# Functions
cd ../functions
npm install
```

### 2. Frontend — desarrollo local

```bash
cd frontend
npm run dev       # Vite dev server con HMR (apunta a Firebase real)
```

Abrir la URL que muestra Vite (por defecto `http://localhost:5173`).

### 3. Functions — desarrollo local (opcional)

```bash
cd functions
npm run build          # Compilar TypeScript
npm run serve          # Build + emulador local solo de functions
```

> `npm run serve` **no** emula Firestore rules/indexes; solo sirve para iterar
> lógica de callable functions. Las functions requieren claim `admin` en el token.

### 4. Validación obligatoria (antes de entregar cualquier cambio)

```bash
cd frontend && npm run lint && npm run build
cd ../functions && npm run lint && npm run build
```

**Ambos** deben pasar sin errores. Este es el Definition of Done mínimo.

---

## Scripts importantes

### Frontend (`frontend/package.json`)

| Script      | Comando real              | Descripción                              |
|-------------|---------------------------|------------------------------------------|
| `dev`       | `vite`                    | Dev server con HMR                       |
| `build`     | `tsc -b && vite build`    | Type-check + build de producción         |
| `lint`      | `eslint .`                | Linting con ESLint 9                     |
| `preview`   | `vite preview`            | Preview del build de producción          |

### Functions (`functions/package.json`)

| Script        | Comando real                                          | Descripción                              |
|---------------|-------------------------------------------------------|------------------------------------------|
| `build`       | `tsc`                                                 | Compilar TypeScript                      |
| `build:watch` | `tsc --watch`                                         | Compilación en watch mode                |
| `lint`        | `eslint --ext .js,.ts .`                              | Linting con ESLint                       |
| `serve`       | `npm run build && firebase emulators:start --only functions` | Emulador local de functions       |
| `deploy`      | `firebase deploy --only functions`                    | Deploy directo de functions              |
| `logs`        | `firebase functions:log`                              | Ver logs en la nube                      |

### Root (`package.json`)

El `package.json` raíz solo declara `firebase` como dependencia compartida.
No tiene scripts propios.

---

## Firebase y despliegue

### Qué se despliega

Según `firebase.json`, el proyecto despliega tres servicios:

1. **Hosting** — sirve `frontend/dist` como SPA (rewrite `**` → `index.html`).
2. **Cloud Functions** — desde `functions/`, con predeploy automático de lint + build.
3. **Firestore Rules + Indexes** — `firestore.rules` y `firestore.indexes.json`.

### Comandos de despliegue

```bash
# Build del frontend primero (hosting sirve frontend/dist)
cd frontend && npm run build

# Deploy completo
firebase deploy

# O por servicio individual:
firebase deploy --only hosting
firebase deploy --only functions          # predeploy ejecuta lint + build
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Checklist de despliegue seguro

Antes de hacer `firebase deploy`:

1. Lint + build de frontend pasan sin errores.
2. Lint + build de functions pasan sin errores.
3. Si tocaste `firestore.rules`: revisaste que los cambios son coherentes con
   el contrato Zod (`db-schema.ts`) y con las validaciones de las functions.
4. Si tocaste `firestore.indexes.json`: el índice nuevo es necesario para
   queries existentes o nuevas.
5. Si tocaste el modelo de datos: hubo mini-RFC y aprobación de Sebas.
6. No hay secretos, API keys ni archivos `.env` en el commit.

---

## Contratos / Datos

### Archivo canónico

El contrato de datos vive en `frontend/src/types/db-schema.ts`.
Define **todos** los modelos de documentos Firestore usando Zod.

### Patrón de 3 capas (Doc / Input / Entity)

Cada modelo de dominio tiene tres variantes:

| Variante       | Propósito                                                        | Ejemplo                    |
|----------------|------------------------------------------------------------------|----------------------------|
| **DocSchema**  | Forma exacta del documento en Firestore (campos requeridos).     | `TransactionDocSchema`     |
| **InputSchema**| Forma parcial/flexible para crear o actualizar (campos opcionales). | `TransactionInputSchema` |
| **EntitySchema**| Doc + `id` (el doc ID de Firestore). Usado en la UI y lógica.   | `TransactionEntitySchema`  |

Este patrón garantiza que:
- Lo que se escribe a Firestore siempre es validable contra `DocSchema`.
- La UI trabaja con `Entity` (que siempre tiene `id`).
- Los formularios y updates parciales usan `InputSchema`.

### Modelos definidos

User, Transaction, SystemCategory, UserCategory, Budget, Objective (+entries),
TransactionTemplate, UsageWeek, Payment, AdvisorChatSession — cada uno con sus
variantes Doc/Input/Entity definidas en el mismo archivo.

### Ownership y colecciones

**User-owned** (bajo `users/{uid}/...`):
- `users/{uid}` — perfil, preferencias, auth metadata
- `users/{uid}/custom_categories/{id}`
- `users/{uid}/transactions/{id}`
- `users/{uid}/templates/{id}`
- `users/{uid}/budgets/{monthKey}`
- `users/{uid}/objectives/{objectiveId}`
- `users/{uid}/objectives/{objectiveId}/entries/{entryId}`
- `users/{uid}/advisorChats/{sessionId}`
- `users/{uid}/advisorChats/{sessionId}/messages/{messageId}`
- `users/{uid}/usageWeeks/{weekKey}`

**Root (acceso restringido)**:
- `system_categories/{id}` — lectura para usuarios autenticados, escritura solo via Cloud Functions (admin).
- `payments/{id}` — lectura para el owner o admin, escritura bloqueada desde cliente.

**Colecciones raíz denegadas**: por diseño, los datos de usuario viven
exclusivamente bajo `users/{uid}/...`. Las colecciones raíz `transactions`,
`templates`, `budgets`, `objectives`, `usage`, `advisorFreeChatUsage`,
`importTransactionsUsage` están explícitamente denegadas en `firestore.rules`.

---

## Reglas del proyecto (resumen)

> La fuente de verdad completa es **`AGENTS.md`**. Léelo antes de tocar código.

1. **TypeScript estricto**: cero `any`; usar `unknown` y narrow.
2. **Feature-first**: cada dominio vive en `src/features/<feature>/`.
3. **Service layer obligatorio**: la UI nunca accede Firestore directo
   (`UI → hooks → services → Firebase SDK`).
4. **Solo named exports**: cero `default export`.
5. **i18n obligatorio**: todo texto visible al usuario viene de claves i18n
   (`src/locales/{es,en}/<namespace>.json`).
6. **Archivos < 200 líneas**, un componente o hook por archivo.
7. **Imports absolutos con `@/`**, en orden: React → terceros → app/lib → features → components → hooks/utils/types → assets.
8. **Dark mode por defecto**: Tailwind class strategy, mobile-first.
9. **Cambios de alto impacto** (data model, auth, rules, deps core) requieren **mini-RFC + aprobación de Sebas**.
10. **Validación pre-entrega**: `npm run lint && npm run build` en **ambos** workspaces.

---

## Workflow multi-IA

FinCore usa un flujo colaborativo con múltiples IAs, cada una con un rol definido.

### Proceso: Plan → Build → Audit

| Fase            | Responsable     | Entregable                                              |
|-----------------|-----------------|----------------------------------------------------------|
| **1. Brief**    | Sebas (Owner)   | Objetivo, scope, restricciones, definición de "hecho"    |
| **2. Plan**     | ChatGPT         | Decisiones, trade-offs, checklist de implementación, AC  |
| **3. Approval** | Sebas           | Go/no-go (obligatorio en cambios de alto impacto)        |
| **4. Build**    | Codex           | Implementación acotada al scope, validada con lint/build |
| **5. Audit**    | Claude          | Revisión de tipado, seguridad, UX, a11y, i18n            |
| **6. Close**    | Sebas           | Merge o ajustes                                          |

### Skills / Playbooks

Las tareas recurrentes tienen playbooks accionables en `docs/skills/`.
Cada skill es un checklist paso a paso para un dominio específico
(Firestore services, Zod contracts, callable functions, i18n keys, ModalShell).

En handoffs y planes, se listan las skills aplicables para que el ejecutor
las consulte antes de implementar.

> Proceso completo, templates de handoff y mini-RFC: ver **`WORKFLOW.md`**.
> Índice de skills: ver **`docs/skills/README.md`**.

---

## Contribución / Definition of Done

### Checklist de PR

- [ ] `cd frontend && npm run lint && npm run build` pasa sin errores.
- [ ] `cd functions && npm run lint && npm run build` pasa sin errores.
- [ ] Todo texto visible al usuario tiene clave i18n (en `es` y `en`).
- [ ] Si se tocó el modelo de datos: `db-schema.ts`, `firestore.rules` y
      `firestore.indexes.json` están alineados.
- [ ] Si se agregó/modificó una Cloud Function: requiere claim admin y
      valida inputs.
- [ ] No hay `any` en el código nuevo.
- [ ] Archivos nuevos siguen las convenciones de naming de `AGENTS.md`.

### Cambios de alto impacto

Si tu cambio toca: modelo de datos, enums, colecciones, `firestore.rules`,
auth/bootstrap, estructura transversal, dependencias core, o es multi-feature:

1. Escribe un **mini-RFC** (problema → solución → alternativas → trade-offs → validación).
2. Pide **aprobación de Sebas** antes de implementar.

Template de mini-RFC en `WORKFLOW.md`.

---

## FAQ

### ¿Por qué no usamos emuladores de Firebase?

Por simplicidad de DX y para evitar drift entre el entorno local y producción
(especialmente en reglas de seguridad y auth). El frontend apunta directamente
al proyecto Firebase real. El único emulador disponible es el de **Cloud Functions**
(`npm run serve` en `functions/`), útil para iterar rápido sobre lógica callable
sin hacer deploy.

### ¿Dónde están los schemas / contrato de datos?

En `frontend/src/types/db-schema.ts`. Es un archivo Zod que define Doc, Input
y Entity para cada modelo. Es la fuente de verdad de estructura de datos.

### ¿Cómo agrego una feature nueva?

1. Crear carpeta en `frontend/src/features/<mi-feature>/` con subcarpetas
   `components/`, `hooks/`, `services/`, `types/` según necesites.
2. Los servicios acceden Firestore; los hooks consumen servicios; los
   componentes consumen hooks.
3. Si necesitas nuevo modelo de datos: actualizar `db-schema.ts`,
   `firestore.rules`, y posiblemente `firestore.indexes.json`.
4. Todo texto visible → clave i18n en ambos idiomas.
5. Seguir `AGENTS.md` para naming, imports y estilo.

### ¿Cómo agrego una clave i18n?

1. Agregar la clave en `frontend/src/locales/es/<namespace>.json`
   y `frontend/src/locales/en/<namespace>.json`.
2. Namespaces actuales: `common`, `auth`, `nav`, `settings`.
3. Si necesitas un namespace nuevo, crearlo en ambos idiomas y registrarlo
   en la config de i18next (`frontend/src/lib/i18n.ts`).
4. En componentes, usar `useTranslation('<namespace>')`.

> Detalle completo: `docs/skills/frontend/i18n-keys-workflow.md`.

### ¿Cómo funcionan las Cloud Functions?

Son funciones callable (no HTTP REST). Todas requieren token con
`admin == true`. Se invocan desde el frontend usando el SDK de Firebase
(`httpsCallable`). Actualmente solo gestionan `system_categories`:
seed, create, update, delete, reorder.

> Detalle completo: `docs/skills/functions/callable-functions-pattern.md`.

### ¿Quién puede modificar `system_categories`?

Solo un usuario con claim `admin` a través de Cloud Functions.
Desde el cliente, `firestore.rules` bloquea escrituras a esa colección.
La UI de admin está en el feature `settings`.

### ¿Qué documento de referencia debo leer primero?

1. `AGENTS.md` — reglas obligatorias (constitución)
2. `AI_CONTEXT.md` — estado actual y gaps conocidos
3. `frontend/src/types/db-schema.ts` — contratos de datos
4. `firestore.rules` — restricciones de seguridad
5. Archivos del feature que vayas a tocar

### ¿Hay tests?

No hay test runner configurado actualmente. `AGENTS.md` define expectativas
mínimas (unit tests para hooks/utils, integration para auth y pantallas críticas),
pero aún no están implementados. TBD.
