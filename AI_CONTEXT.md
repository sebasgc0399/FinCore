# AI Context - FinCore

Last updated: 2026-02-07

## 1) Project goal
FinCore is a mobile-first personal finance web app (v2) focused on:
- clean architecture
- strict TypeScript
- scalable Firebase data model
- consistent UX across mobile and desktop

## 2) Non-negotiable rules (read first)
1. `AGENTS.md` is the project constitution and has priority.
2. Strict TypeScript: no `any`, typed inputs/outputs.
3. Feature-first architecture.
4. Do not access Firestore directly from UI components.
5. Use Google auth with `signInWithPopup` only.
6. Keep auth domain resolution in `src/lib/firebase.ts` (`resolveAuthDomain`).
7. All user-facing text must come from i18n keys.
8. Prefer absolute imports with `@/` alias.

## 3) Tech stack and workspace
- Frontend: React 19 + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Firebase (Firestore + Cloud Functions + Hosting)
- Validation/data contracts: Zod (`frontend/src/types/db-schema.ts`)
- i18n: i18next + react-i18next

Workspace layout:
- `frontend/` web app
- `functions/` Firebase Cloud Functions
- `firestore.rules` security rules
- `firestore.indexes.json` composite indexes

## 4) Runtime architecture (current)
App composition:
`main.tsx -> App.tsx -> ThemeProvider -> AuthProvider -> AppRouter`

Route shell:
- Protected area uses `AppShell` with bottom nav and transaction FAB.
- Public route: `/login`.

Data flow pattern:
`UI components -> feature hooks -> feature services -> Firebase SDK / Callable Functions`

Key files:
- Firebase init: `frontend/src/lib/firebase.ts`
- Auth provider + bootstrap: `frontend/src/features/auth/components/AuthProvider.tsx`
- Auth service: `frontend/src/features/auth/services/authService.ts`
- User bootstrap: `frontend/src/features/auth/services/userBootstrap.ts`
- Settings services:
  - `frontend/src/features/settings/services/userPreferences.ts`
  - `frontend/src/features/settings/services/system-categories.ts`

## 5) Firestore model (initial contract)
Canonical TS/Zod contract is `frontend/src/types/db-schema.ts`.

Primary document models defined there:
- `UserDoc`
- `Transaction`
- `SystemCategory`
- `UserCategory`
- `Budget`
- `Objective`
- `ObjectiveEntry`
- `TransactionTemplate`
- `UsageDoc`
- `PaymentDoc`
- `AdvisorChatSession`

Relevant enum domains already standardized:
- transaction type: `expense | income`
- payment method: `cash | debit | credit | digital | other`
- language: `es | en`
- currency: `COP | USD`

## 6) Firestore collections and access (current)
Observed collection usage:
- `users/{uid}`
- `users/{uid}/custom_categories/{categoryId}`
- `system_categories/{categoryId}`
- `transactions/{transactionId}`
- `templates/{templateId}`
- `budgets/{budgetId}`
- `objectives/{objectiveId}` + `entries/{entryId}`
- `usage/{uid}`
- `advisorFreeChatUsage/{uid}`
- `importTransactionsUsage/{uid}`
- `payments/{paymentId}`
- `users/{uid}/advisorChats/*` and `users/{uid}/advisor_sessions/*`

Security notes from `firestore.rules`:
- `system_categories`: read for signed-in users, writes blocked from client.
- system category writes are expected through callable Cloud Functions (admin only).
- `users/{uid}` create/update constrained by field shape and auth invariants.
- user-owned resources (`transactions`, `budgets`, `templates`, `objectives`) enforce `userId == request.auth.uid`.

## 7) Cloud Functions (current)
`functions/src/index.ts` exports callable functions:
- `seedSystemCategories`
- `createSystemCategory`
- `updateSystemCategory`
- `deleteSystemCategory`
- `reorderSystemCategories`

All require admin claims (`request.auth.token.admin == true`).

## 8) Current development status (snapshot)
Implemented:
- Google sign-in flow with popup and sign-out.
- User bootstrap on auth (user doc + default custom categories).
- Theme and language preference sync from Firestore.
- Settings area with admin CRUD/reorder for system categories via callable functions.
- Reusable `ModalShell` (Drawer on mobile, Dialog on desktop).

In progress / partial:
- Expense capture UI (`TransactionSheet`) is local-state only; save action is mocked (payload + timeout), not persisted.
- Core pages (`Home`, `Movements`, `Objectives`, `Metrics`, `Advisor`) are mostly placeholder content.

Known gaps to keep in mind:
- Payment method values in `TransactionSheet` (`card`, `transfer`) do not fully match DB enum contract (`cash`, `debit`, `credit`, `digital`, `other`).
- Recurrence frequency in expense UI does not include all schema variants (`biweekly` exists in schema template frequency domain).
- Some visible text is still hardcoded in pages instead of i18n keys.
- i18n detection currently uses navigator only; project rules expect localStorage key `fincore_lang` with browser fallback.

## 9) Commands to run and validate
From repo root:
- Install root deps (if needed): `npm install`

Frontend:
- `cd frontend`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview build: `npm run preview`

Functions:
- `cd functions`
- Lint: `npm run lint`
- Build: `npm run build`
- Emulators (functions): `npm run serve`

Firebase deploy predeploy runs function lint/build from `firebase.json`.

## 10) How to brief another AI (copy/paste template)
Use this exact block for each new task:

```md
## Task
<what to build/fix>

## Scope
- In scope: <files/features allowed>
- Out of scope: <what not to touch>

## Constraints
- Follow `AGENTS.md`
- No direct Firestore access from UI
- Use i18n keys for all user text
- Keep strict TypeScript (no `any`)

## Relevant context
- Architecture: `UI -> hooks -> services -> Firebase/Functions`
- Data contract: `frontend/src/types/db-schema.ts`
- Security: `firestore.rules`

## Acceptance criteria
1. <behavioral requirement>
2. <UI/UX requirement>
3. <typing/test requirement>

## Validation
- `cd frontend && npm run lint && npm run build`
- `cd functions && npm run lint && npm run build`
```

## 11) Recommended read order for any AI agent
1. `AGENTS.md`
2. `AI_CONTEXT.md`
3. `frontend/src/types/db-schema.ts`
4. `firestore.rules`
5. Feature files directly related to the assigned task
