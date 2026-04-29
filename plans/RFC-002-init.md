# RFC-002 - Migracion a NextAudit AI

| Campo | Valor |
| --- | --- |
| ID | RFC-002 |
| Titulo | Migracion de ai-compliance-sentinel a NextAudit AI |
| Estado | Aprobado |
| Fecha | 2026-04-28 |
| Autor | Equipo NextAudit AI |

## Resumen

Este RFC define la migracion del repositorio y la limpieza de linea base para la nueva identidad SaaS de NextAudit AI.

## Alcance

- Rebranding de referencias del proyecto a NextAudit AI / nextaudit-ai.
- Mantener `main` minima y estable.
- Mantener la implementacion completa en `develop`.
- Mantener el trabajo documental en `docs`.

## Estrategia de ramas

- `main`: base estable (`README.md`, `.gitignore`, compose base).
- `develop`: evolucion activa del producto y la infraestructura.
- `docs`: documentacion tecnica y manuales.

## Decisiones clave

1. Eliminar de `develop` archivos antiguos de onboarding y evaluacion.
2. Actualizar `plans/` al contexto de roadmap SaaS.
3. Mantener Ollama como infraestructura opcional, no como cerebro principal de orquestacion.

## Riesgos

- Pueden quedar referencias heredadas en documentos historicos.
- El equipo puede requerir re-onboarding por el cambio de flujo de ramas.

## Mitigaciones

- Reforzar convenciones de ramas en `CONTRIBUTING.md`.
- Registrar los cambios de migracion en `CHANGELOG.md`.

## Criterios de aceptacion

- `develop` no contiene documentos obsoletos de onboarding/evaluacion.
- `plans/` refleja la direccion actual del producto.
- `CONTRIBUTING.md` y `CHANGELOG.md` coinciden con el flujo vigente.