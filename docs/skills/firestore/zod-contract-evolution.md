---
name: "Zod Contract Evolution"
version: "1.1"
scope: "firestore"
triggers: "Agregar colección, modificar campos de documento, cambiar enums"
applies_to:
  - "frontend/src/types/db-schema.ts"
  - "firestore.rules"
  - "firestore.indexes.json"
  - "functions/src/**/*.ts"
last_updated: "2026-02-07"
---

# Zod Contract Evolution

## Objetivo
Proceso para evolucionar el contrato canónico de datos (`db-schema.ts`) y mantener alineados security rules, indexes, Cloud Functions y frontend services.

## Do
- Actualizar `frontend/src/types/db-schema.ts` PRIMERO (fuente de verdad)
- Usar `z.infer<typeof MySchema>` para derivar types (no definir types manuales paralelos)
- Agregar nuevos enums como `z.enum([...])` exportados
- Validar que `firestore.rules` permita los campos nuevos/modificados
- Revisar `firestore.indexes.json` si el cambio afecta queries con filtros compuestos u `orderBy`
- Actualizar helpers de validación en `functions/src/index.ts` si el campo nuevo requiere parsing
- Verificar que los services del frontend normalizan el campo nuevo

## Don't
- Definir types separados que dupliquen el schema Zod (usar `z.infer<>`)
- Modificar rules o functions sin actualizar `db-schema.ts` primero
- Agregar campos required a documentos existentes sin migration strategy
- Asumir que los enums de `db-schema.ts` están actualizados en este archivo; verificar el archivo real

## Flujo recomendado
1. **Schema:** modificar/agregar schema en `db-schema.ts`
   - Nuevo campo opcional: `.optional()` para backwards compatibility
   - Nuevo enum: exportar el schema (`z.enum(...)`) y el type (`z.infer<>`)
2. **Security rules:** actualizar `firestore.rules` si el campo tiene restricciones de write
3. **Indexes:** actualizar `firestore.indexes.json` si cambian queries con filtros compuestos
4. **Functions:** agregar helper de validación si la función recibe el campo nuevo
5. **Frontend service:** normalizar con `safeParse` o type guards manuales (ver nota abajo)
6. **Validar:** lint + build en ambos workspaces

## Migration strategy (campos nuevos en docs existentes)
- Hacer el campo `.optional()` en el schema
- En el normalizer del frontend service: default seguro si el campo está ausente
- **Backfill opcional:** si se necesita persistir el default, hacer write-back controlado (batch + script o Cloud Function one-off). Requiere mini-RFC si afecta muchos docs.
- Nunca hacer `.required()` sin haber backfilleado TODOS los docs existentes

## Template / Checklist

```ts
// 1. db-schema.ts — agregar al schema
export const TransactionSchema = z.object({
  // ... campos existentes
  currency: CurrencyCodeSchema.optional(), // opcional para backwards compat
})
```

```ts
// 2. Frontend service — normalizar con safeParse o type guard
const result = CurrencyCodeSchema.safeParse(data.currency)
const currency = result.success ? result.data : "COP" // default seguro
```

- [ ] `db-schema.ts` actualizado (schema + type export)
- [ ] `firestore.rules` alineado con el nuevo campo
- [ ] `firestore.indexes.json` revisado si cambian queries
- [ ] Functions: helper de validación creado/actualizado
- [ ] Frontend service: normalizer maneja el campo nuevo (safeParse o type guard)
- [ ] Migration strategy definida si el campo afecta docs existentes
- [ ] `cd frontend && npm run lint && npm run build`
- [ ] `cd functions && npm run lint && npm run build`

## Edge cases
- **Enum changes (agregar valor):** agregar al `z.enum()` + actualizar rules si validan enum values
- **Enum changes (remover valor):** buscar uso en codebase antes de eliminar; puede romper docs existentes
- **Colección nueva:** schema completo + match block en rules + index si tiene queries + service + hook

## Referencias internas
- `frontend/src/types/db-schema.ts` (contrato canónico)
- `firestore.rules` y `firestore.indexes.json`
- `functions/src/index.ts` (helpers de validación)
- `docs/skills/firestore/firestore-service-pattern.md` (normalización en services)
- `AGENTS.md` §TypeScript Rules (sin `any`, tipado estricto)
