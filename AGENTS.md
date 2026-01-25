# FinCore Project Rules and Context

You are an expert Senior Software Architect and Senior React/TypeScript Developer.
This file is the constitution for any AI working on FinCore. Follow it exactly.

## Project Goal
FinCore is a mobile-first personal finance web app (v2) focused on scalability,
clean architecture, and a consistent user experience.

## Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: Firebase v9 (Modular SDK), Firestore, Cloud Functions, Hosting
- State: React Context + Hooks (keep it simple)
- Date handling: date-fns
- i18n: i18next + react-i18next + i18next-browser-languagedetector

## Core Pillars
1. Mobile-first: every UI is responsive and touch friendly.
2. Strict TypeScript: no `any`; define types for props and data models.
3. Modular architecture: small files and reusable components.
4. Performance: avoid unnecessary re-renders; memoize when it matters.
5. Clean code: readable, predictable, minimal side effects.

## Architecture and Folder Structure
Use a feature-first structure and keep shared code in dedicated folders.

Preferred structure:

src/
  app/                 # App shell, providers, routes, layouts
  components/          # Shared UI wrappers (not feature-specific)
  features/
    auth/
      components/
      hooks/
      services/
      types/
      index.ts
    expenses/
    budgets/
    goals/
    reports/
  hooks/               # Global reusable hooks
  lib/                 # Firebase setup, utilities, helpers
  styles/              # Tailwind tokens, global styles
  types/               # Shared TypeScript types
  assets/              # Static assets

Rules:
- Feature logic lives in `src/features/<feature>`.
- Shared components go in `src/components`.
- Firebase setup in `src/lib/firebase`.
- Do not create a "utils" dump. Use named modules.
- Avoid barrel files unless they define a clear public API.

## Clean Code Rules
- One component or hook per file.
- Keep files small and focused (prefer < 200 lines).
- Early returns over deep nesting.
- Prefer composition over inheritance.
- Avoid side effects in render.
- Name variables after the domain, not UI details.

## TypeScript Rules
- No `any`; use `unknown` and narrow it.
- Prefer `type` for props and unions.
- Use `interface` for data models that may be extended.
- Always type function inputs and return values.
- Use `as const` for constant maps and literals.

## React Component Rules
- Functional components only.
- Named exports only; no default exports.
- **Do not use explicit `: JSX.Element` return type; let TypeScript infer it.**
- `const ComponentName = (props: Props) => { ... }`
- Destructure props at the top of the component.
- Split UI from data fetching by using custom hooks.
- Use `React.memo` only when profiling shows a need.

## State Management
- Local state first (`useState`, `useReducer`).
- Global state only when needed (Auth, Theme, App config).
- Use React Context + custom hooks (no Redux/MobX unless approved).
- Avoid prop drilling by lifting state to the nearest feature root.
- Do not store derived data in state; compute it.

## Firebase and Data Access
- Use Modular SDK imports only.
- Centralize Firebase initialization in `src/lib/firebase`.
- All Firestore access through a small service layer per feature.
- Never access Firestore directly from UI components.
- Use `try/catch` for all async calls and surface errors to the UI.
- Prefer server timestamps and strongly typed models.
- Auth: use Google `signInWithPopup` only; do not reintroduce redirect flows.
- Keep authDomain resolution in `src/lib/firebase` (do not bypass `resolveAuthDomain`).

## Styling and UI (Tailwind + shadcn/ui)
- Use Tailwind classes; avoid custom CSS unless needed.
- Mobile-first classes (`sm:`, `md:`) and touch targets >= 44px.
- Use the `cn` helper for conditional class names.
- Stick to a design token system (spacing, colors, radius, typography).
- Support dark mode by default (class strategy).

## shadcn/ui Rules
- Keep generated components in `src/components/ui`.
- Do not edit generated components unless required; wrap instead.
- Create feature-specific wrappers in `src/components` or `src/features/<feature>/components`.
- Use `cva` for variants; keep variant names short and consistent.
- Use Radix primitives as designed; do not break accessibility contracts.

## Internationalization (i18n)
- All user-facing text must come from i18n keys; avoid hardcoded strings in UI.
- Translations live in `src/locales/<lang>/<namespace>.json` (feature-based namespaces).
- Keep JSON files in UTF-8 to avoid mojibake; fix encoding at the source.
- Use `i18n.language` and `src/lib/formatters.ts` for currency/date formatting.
- Language preference uses `localStorage` key `fincore_lang` with browser fallback.

## Modals and Sheets
- Use `ModalShell` for standard modals (Drawer on mobile, Dialog on desktop).
- Only bypass `ModalShell` for truly unique UX; document the reason in code.
- When using `ModalShell`, configure optional Drawer props (snapPoints, etc.) instead of custom wrappers.

## Naming Conventions
- Components: `PascalCase` (e.g., `LoginForm.tsx`)
- Hooks: `useCamelCase` (e.g., `useAuth.ts`)
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files:
  - Components: `PascalCase.tsx`
  - Hooks: `useSomething.ts`
  - Non-component modules: `kebab-case.ts`
  - Folders: `kebab-case`

## Imports (Order and Style)
Prefer absolute imports with alias `@/` for `src/`.

Order:
1) React and core libraries
2) Third-party libraries
3) App-level modules (`@/app`, `@/lib`)
4) Feature modules (`@/features/...`)
5) Shared components (`@/components/...`)
6) Hooks, utils, types
7) Assets and styles

Example:
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";

import type { LoginPayload } from "@/features/auth/types";

## Error Handling and UX
- Every async call in `try/catch`.
- Surface errors to users (toast or inline feedback).
- Provide loading and empty states for lists.
- Use Error Boundaries for top-level routes.

## Performance and Rendering
- Avoid unnecessary state updates.
- Memoize expensive calculations with `useMemo`.
- Memoize stable callbacks with `useCallback` only when needed.
- Prefer list virtualization for large lists.

## Accessibility (Required)
- Use semantic HTML.
- All form fields must have labels.
- Interactive elements must be keyboard accessible.
- Provide aria attributes when needed.

## Testing (Minimum Expectations)
- Unit tests for core hooks and utilities.
- Integration tests for auth flow and critical screens.

## When In Doubt
- Ask clarifying questions instead of assuming.
- Follow the existing patterns in the codebase.
- Keep solutions simple and explain trade-offs.