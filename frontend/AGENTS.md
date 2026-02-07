# FinCore Frontend

Leer primero el `AGENTS.md` raiz (constitucion del proyecto).

## Cadena de Composicion
```
main.tsx → App.tsx → ThemeProvider → AuthProvider → AppRouter
  → ProtectedRoute / PublicRoute → AppShell (bottom nav + FAB) → Pages
```

## Archivos Clave
| Archivo | Proposito |
|---------|-----------|
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Root component |
| `src/app/ThemeProvider.tsx` | Contexto de tema |
| `src/features/auth/components/AuthProvider.tsx` | Contexto de auth + bootstrap |
| `src/features/auth/services/userBootstrap.ts` | Creacion de user doc + categorias default |
| `src/lib/firebase.ts` | Firebase init + `resolveAuthDomain` (iOS Safari) |
| `src/types/db-schema.ts` | Contratos Zod canonicos |
| `src/components/common/ModalShell.tsx` | Modal responsivo (Drawer mobile, Dialog desktop) |
| `src/lib/i18n.ts` | Configuracion i18next |
| `src/lib/formatters.ts` | Formateo de moneda/fecha |

## Template de Feature Directory
```
src/features/<feature-name>/
  components/    — UI del feature
  hooks/         — Hooks especificos
  services/      — Acceso a Firestore / callable functions
  types/         — Tipos especificos (opcional)
  index.ts       — Barrel file (solo si se importa desde otros features)
```

## Features Actuales
- **auth** — login, sign-out, user bootstrap, rutas protegidas/publicas
- **settings** — admin CRUD de system categories, preferencias de usuario
- **expenses** — TransactionSheet, TransactionDetails, TransactionKeypad

## Google Auth
Reglas de auth están en `AGENTS.md` (sección "Firebase and Data Access").
Archivo clave: `src/lib/firebase.ts` (incluye `resolveAuthDomain` para iOS Safari).
