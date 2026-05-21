# Arquitectura del Backend de NextAudit AI

NextAudit AI evoluciona de un modulo local basado en un bridge hacia un backend SaaS con limites explicitos para identidad, tenant, telemetria, gobierno de IA y auditoria.

El primer objetivo productivo es un monolito modular con NestJS. Esta decision mantiene eficiente el desarrollo local y, al mismo tiempo, deja cada dominio con una frontera clara que puede extraerse mas adelante si la escala o la organizacion del equipo lo requieren.

## Componentes en Tiempo de Ejecucion

- `apps/api`: API SaaS publica consumida por Angular y por clientes de automatizacion confiables.
- `apps/worker`: procesamiento en segundo plano para ingesta de alertas, sincronizacion con Fleet, notificaciones, medicion de uso y futuros trabajos de IA.
- `packages/shared`: contratos y eventos versionados compartidos por la API, el worker y futuros clientes.
- PostgreSQL: persistencia principal del SaaS. En desarrollo local debe usar una sola instancia con esquemas por dominio.
- Redis: dependencia local opcional para colas, rate limiting, cache de corta vida e invalidacion de tokens/sesiones.

## Limites de Dominio

- `auth`: login, refresh, logout y emision de tokens.
- `iam`: usuarios, roles, permisos y membresias.
- `tenants`: contexto del cliente SaaS y propiedad del plan.
- `alerts`: modelo persistido de consulta para alertas y hallazgos.
- `fleet-read`: fachada backend sobre FleetDM.
- `webhooks`: entrada confiable de automatizaciones desde n8n y futuras integraciones.
- `ai-chat`: acceso gobernado a IA.
- `llm-governance`: llaves de proveedores, uso de tokens y control de costos.
- `audit-log`: trazabilidad de seguridad y administracion.

## Regla Inicial de Migracion

Angular debe terminar llamando solo a `NextAudit API`. FleetDM, Flowise, n8n y los proveedores LLM deben quedar como integraciones del servidor, no como dependencias expuestas al navegador.
