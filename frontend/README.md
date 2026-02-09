# FinCore Frontend

Web app mobile-first de finanzas personales. Este es el workspace del frontend:
una SPA con React 19, Vite, TypeScript estricto, Tailwind + shadcn/ui, e i18next
para internacionalización. Se conecta a Firebase (Auth, Firestore, Cloud Functions)
sin capa de backend propia.

> Para documentación completa del proyecto (deploy, contratos, reglas, FAQ),
> ver el `README.md` del root.
> Para reglas obligatorias de código, ver `AGENTS.md` (root).

---

## Stack

| Librería | Uso |
|---|---|
| React 19 + Vite | UI framework + bundler/dev server con HMR |
| TypeScript (ver `frontend/package.json`) | Tipado estricto, cero `any` |
| Tailwind CSS + shadcn/ui | Estilos utility-first + componentes Radix accesibles |
| i18next + react-i18next | Internacionalización (es/en) |
| Zod | Validación y contratos de datos (Doc/Input/Entity) |
| Firebase SDK v9 (modular) | Auth, Firestore, Cloud Functions callable |
| react-router-dom (ver `frontend/package.json`) | Routing SPA |
| date-fns | Manejo de fechas |
| vaul | Drawer component (usado por ModalShell en mobile) |
| lucide-react | Iconos |

---

## Estructura de carpetas

```
frontend/src/
├── app/                    # Shell de la aplicación
│   ├── AppRouter.tsx       # Definición de rutas
│   ├── ThemeProvider.tsx    # Contexto de tema (light/dark/system)
│   ├── layouts/
│   │   └── AppShell.tsx    # Layout protegido (bottom nav + FAB)
│   └── pages/              # Páginas de ruta (Home, Movements, etc.)
│
├── features/               # Módulos por dominio (feature-first)
│   ├── auth/               # Login, sign-out, bootstrap, rutas protegidas
│   ├── expenses/           # TransactionSheet, keypad, category chips
│   └── settings/           # Preferencias, admin CRUD system categories
│
├── components/
│   ├── ui/                 # Componentes shadcn/ui generados (no editar)
│   ├── common/             # Wrappers compartidos (ModalShell, SelectSheet)
│   └── ThemeToggle/        # Toggle de tema
│
├── hooks/                  # Hooks globales (useMediaQuery, useTheme)
├── lib/                    # Infraestructura y utilidades
│   ├── firebase.ts         # Firebase init + resolveAuthDomain
│   ├── i18n.ts             # Config de i18next (namespaces, detection)
│   ├── formatters.ts       # Formato de moneda/fecha por locale
│   └── utils.ts            # Helper cn() para class names
│
├── locales/                # Traducciones por namespace
│   ├── es/                 # common.json, auth.json, nav.json, settings.json
│   └── en/                 # (mismos archivos)
│
├── types/
│   └── db-schema.ts        # Contratos Zod canónicos (Doc/Input/Entity)
│
└── assets/                 # Archivos estáticos
```

### Cada feature sigue esta estructura:

```
features/<feature>/
  components/    # UI del feature
  hooks/         # Hooks específicos
  services/      # Acceso a Firestore / callable functions
  types/         # Tipos específicos (opcional)
```

No todas las subcarpetas son obligatorias; crear solo las necesarias.

---

## Flujo de datos

```
UI components  →  feature hooks  →  feature services  →  Firebase SDK / Callable Functions
```

- **Componentes** consumen hooks, nunca acceden a Firestore directo.
- **Hooks** orquestan lógica y exponen estado a la UI.
- **Services** encapsulan llamadas a Firestore o `httpsCallable`.
- **Cloud Functions** (admin-only) se invocan desde services cuando las reglas
  de seguridad bloquean escritura directa desde el cliente (ej: `system_categories`).
  Ver playbook: `docs/skills/functions/callable-functions-pattern.md`.

---

## i18n

Todo texto visible al usuario debe venir de claves i18n. Sin excepciones.
No usar keys dinámicas (`t(variable)`) salvo mapas controlados (`as const`).

### Namespaces actuales

| Namespace | Contenido |
|---|---|
| `common` | Vocabulario compartido (botones, labels, mensajes generales) |
| `auth` | Login, sign-up, sign-out |
| `nav` | Labels de navegación |
| `settings` | UI de configuración |

Archivos: `src/locales/{es,en}/<namespace>.json`

### Agregar una clave

1. Agregar en `src/locales/es/<namespace>.json` y `src/locales/en/<namespace>.json`.
2. En el componente: `const { t } = useTranslation("<namespace>")`.
3. Usar `t("mi_clave")` en el JSX.

### Crear un namespace nuevo

1. Crear los JSON en ambos idiomas.
2. Importarlos en `src/lib/i18n.ts`.
3. Agregarlos al objeto `resources` y al array `ns`.

> Playbook completo: `docs/skills/frontend/i18n-keys-workflow.md`

---

## Auth

La autenticación usa Google Sign-In con `signInWithPopup` exclusivamente.

| Archivo | Responsabilidad |
|---|---|
| `features/auth/components/AuthProvider.tsx` | Context provider, escucha `onAuthStateChanged`, ejecuta bootstrap |
| `features/auth/services/userBootstrap.ts` | Al primer login: crea user doc + categorías custom default en Firestore |
| `features/auth/services/authService.ts` | `signInWithGoogle()`, `signOut()` |
| `features/auth/hooks/useAuth.ts` | Hook para consumir el contexto de auth |
| `features/auth/components/ProtectedRoute.tsx` | Wrapper que redirige a `/login` si no hay sesión |
| `lib/firebase.ts` | Init de Firebase + `resolveAuthDomain` (fix para iOS Safari) |

### Cadena de composición

```
main.tsx → App.tsx → ThemeProvider → AuthProvider → AppRouter
  → ProtectedRoute → AppShell (bottom nav + FAB) → Pages
  → PublicRoute → /login
```

---

## UI patterns

### ModalShell

Componente responsivo: Drawer en mobile, Dialog en desktop.
Usar para formularios y acciones en overlay. Configurar props de Drawer
(snapPoints, etc.) en vez de crear wrappers custom.

> Playbook: `docs/skills/ux/modal-shell-usage.md`

### shadcn/ui

Los componentes generados viven en `src/components/ui/`. Evitar editarlos directamente;
preferir wrappers en `src/components/common/` o en el feature correspondiente.
Si se edita un componente de `ui/`, documentar el motivo (shadcn puede regenerarlo).

---

## Comandos

Todos desde `frontend/`:

```bash
npm install       # Instalar dependencias
npm run dev       # Vite dev server con HMR (http://localhost:5173)
npm run lint      # ESLint
npm run build     # tsc -b && vite build (type-check + build producción)
npm run preview   # Preview del build de producción
```

### Validación obligatoria (antes de entregar)

```bash
npm run lint && npm run build
```

Debe pasar sin errores. Ver el root `README.md` para la validación completa
(incluye `functions/`).

---

## Crear una feature nueva

1. Crear `src/features/<mi-feature>/` con las subcarpetas que necesites
   (`components/`, `hooks/`, `services/`, `types/`).
2. Services acceden Firestore; hooks consumen services; componentes consumen hooks.
3. Si necesitas modelo de datos nuevo: actualizar `src/types/db-schema.ts`,
   `firestore.rules`, y posiblemente `firestore.indexes.json`.
4. Todo texto visible al usuario: clave i18n en ambos idiomas.
5. Un componente o hook por archivo. Archivos < 200 líneas.
6. Named exports solamente (cero `default export`).
7. Imports absolutos con `@/`, en el orden definido en `AGENTS.md`.

---

## Links

| Recurso | Ruta |
|---|---|
| Reglas del proyecto (constitución) | `AGENTS.md` (root) |
| Contexto del frontend | `frontend/AGENTS.md` |
| Contratos Zod | `frontend/src/types/db-schema.ts` |
| Reglas de seguridad | `firestore.rules` |
| Skill: i18n keys | `docs/skills/frontend/i18n-keys-workflow.md` |
| Skill: Firestore service | `docs/skills/firestore/firestore-service-pattern.md` |
| Skill: Callable functions | `docs/skills/functions/callable-functions-pattern.md` |
| Skill: ModalShell | `docs/skills/ux/modal-shell-usage.md` |
| Índice de skills | `docs/skills/README.md` |
| Docs completas del proyecto | `README.md` (root) |
