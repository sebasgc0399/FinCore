---
---

# Reglas Operativas Claude Code

`AGENTS.md` es la fuente de verdad para TODAS las reglas de código.
Léelo al inicio de cada tarea. Este archivo solo agrega guardrails operativos.

## Guardrails críticos (quick reference de AGENTS.md)
- Cero `any`; usar `unknown` y narrow. Excepción Zod: `z.infer<>` produce `type`.
- Solo named exports; cero default exports.
- Imports absolutos con `@/`. Orden: React → terceros → `@/app`,`@/lib` → `@/features` → `@/components` → hooks/utils/types → assets.
- No anotar `: JSX.Element` en retornos de componentes; dejar que TS infiera.
- Un componente o hook por archivo; archivos < 200 líneas.

## Antes de implementar
1. Leer `AGENTS.md` (constitución) y `AI_CONTEXT.md` (estado actual y gaps).
2. Leer los archivos del feature involucrado antes de proponer cambios.
3. Para cambios de alto impacto (arquitectura, data model, auth, security rules): escribir mini-RFC y pedir aprobación.

## Validación (ejecutar ambos antes de entregar)
```bash
cd frontend && npm run lint && npm run build
cd functions && npm run lint && npm run build
```

## Convenciones verificables
- Scripts disponibles: revisar `package.json` de cada workspace.
- Runtime de functions: verificar campo `engines` en `functions/package.json`.
- No hay test runner configurado actualmente.
