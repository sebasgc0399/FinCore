---
name: "i18n Keys Workflow"
version: "1.1"
scope: "frontend"
triggers: "Agregar texto visible al usuario, crear namespace, auditar hardcoded strings"
applies_to:
  - "frontend/src/locales/**/*.json"
  - "frontend/src/lib/i18n.ts"
  - "frontend/src/features/**/components/*.tsx"
last_updated: "2026-02-07"
---

# i18n Keys Workflow

## Objetivo
Mantener todo texto visible al usuario bajo claves i18n, en ambos idiomas (es/en), sin hardcoded strings en JSX.

## Do
- Usar `const { t } = useTranslation("<namespace>")` en componentes
- Agregar claves en AMBOS archivos: `locales/es/<ns>.json` y `locales/en/<ns>.json`
- Usar namespaces feature-based (ver lista en `.claude/rules/40-i18n.md`)
- Usar `i18n.language` y `frontend/src/lib/formatters.ts` para formato de moneda/fecha
- Mantener archivos JSON en UTF-8

## Don't
- Hardcodear strings en JSX: `<p>Guardar</p>` (usar `<p>{t("save")}</p>`)
- Agregar clave en un idioma y olvidar el otro
- Crear namespaces sin registrarlos en `i18n.ts`
- Usar template literals con texto visible: `` `Hola ${name}` `` (usar interpolación i18n)
- Keys dinámicas: `t(someVariable)` — salvo mapas controlados (`const map = { a: "key.a" } as const`)

## Flujo recomendado

### Agregar texto a un namespace existente
1. Identificar el namespace (`common`, `auth`, `nav`, `settings`, etc.)
2. Agregar clave en `frontend/src/locales/es/<namespace>.json`
3. Agregar clave en `frontend/src/locales/en/<namespace>.json`
4. Usar en componente: `t("<key>")` si el namespace ya está en `useTranslation`

### Crear un namespace nuevo
1. Crear `frontend/src/locales/es/<namespace>.json`
2. Crear `frontend/src/locales/en/<namespace>.json`
3. Importar ambos en `frontend/src/lib/i18n.ts`
4. Agregar al objeto `resources` (en ambos idiomas) y al array `ns`
5. Usar: `const { t } = useTranslation("<namespace>")`

## Template / Checklist

```json
// frontend/src/locales/es/common.json
{ "export": "Exportar" }
```

```json
// frontend/src/locales/en/common.json
{ "export": "Export" }
```

```tsx
const { t } = useTranslation("common")
return <Button>{t("export")}</Button>
```

Interpolación:
```json
{ "greeting": "Hola, {{name}}" }
```
```tsx
t("greeting", { name: user.displayName })
```

- [ ] Clave agregada en `locales/es/<ns>.json`
- [ ] Clave agregada en `locales/en/<ns>.json`
- [ ] Componente usa `t()` (no string literal)
- [ ] Si namespace nuevo: registrado en `i18n.ts` (import + resources + ns)
- [ ] Formatos de moneda/fecha usan `formatters.ts`
- [ ] No hay keys dinámicas sueltas (`t(var)`) — solo mapas `as const`

## Edge cases
- **Gap `fincore_lang`:** la detección actual usa solo `navigator`; la regla dice localStorage `fincore_lang` con fallback. Corregir esto es **High-Impact** (requiere mini-RFC + aprobación de Sebas). Ver `AI_CONTEXT.md` §8.
- **Claves con puntos:** i18next interpreta `.` como separador de nested keys; usar flat keys
- **Plurales:** i18next soporta `_one`, `_other` suffixes para pluralización
- **Texto en atributos:** `aria-label`, `placeholder`, `title` también deben usar `t()`

## Referencias internas
- `AGENTS.md` §Internationalization (regla: todo texto visible via i18n)
- `frontend/src/lib/i18n.ts` (config actual: namespaces, detection, fallback)
- `frontend/src/lib/formatters.ts` (formato moneda/fecha)
- `.claude/rules/40-i18n.md` (namespaces actuales, cómo agregar namespace)
