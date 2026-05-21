# ADR-002: Control de acceso por rol con contexto de tenant

## Estado

Aceptado

## Contexto

El producto SaaS necesita tres roles estrictos:

- `viewer`: visibilidad de flota y alertas en modo solo lectura, sin acceso a IA.
- `admin`: gestion de politicas de cumplimiento y uso gobernado de IA.
- `super_admin`: rol de fundador/operador para usuarios, logs de auditoria y control de llaves/costos LLM.

## Decisión

Los JWT de acceso deben incluir id de usuario, id de tenant, rol, permisos y contexto del plan. Angular puede usar estos claims para navegacion y visibilidad de UI, pero los guards del backend siguen siendo la fuente de verdad.

## Base de Permisos

| Rol | Permisos |
| --- | --- |
| `viewer` | `alerts:read`, `fleet:read` |
| `admin` | permisos de viewer, `policies:manage`, `ai_chat:use` |
| `super_admin` | permisos de admin, `users:manage`, `audit_logs:read`, `llm_keys:manage` |

## Consecuencias

- Los guards del frontend son solo para experiencia de usuario.
- Los guards del backend aplican toda accion protegida.
- El id de tenant debe adjuntarse a toda consulta con alcance de usuario.
- Las funciones de IA deben validar rol/permiso y tambien derecho de uso.
