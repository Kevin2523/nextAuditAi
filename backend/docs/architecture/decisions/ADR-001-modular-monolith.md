# ADR-001: Usar primero un monolito modular con NestJS

## Estado

Aceptado

## Contexto

NextAudit AI hoy corre como un stack local de desarrollo con Angular, FleetDM, n8n, Flowise, PostgreSQL, MySQL, Redis y un bridge pequeno en Express. El producto se esta moviendo hacia SaaS, pero la eficiencia en hardware local sigue siendo importante.

## Decisión

Usar un monolito modular con NestJS, compuesto por una aplicacion API y una aplicacion worker dentro del mismo workspace de backend.

## Justificacion

- Mantiene razonable el consumo de recursos en Docker/WSL2 para desarrollo local.
- Da al equipo una sola frontera desplegable mientras los requisitos del producto siguen evolucionando.
- Permite ownership claro por modulo: IAM, alertas, gobierno de IA, integraciones y auditoria.
- Permite extraer modulos a servicios independientes cuando el volumen, el tamano del equipo o las necesidades de aislamiento lo justifiquen.

## Consecuencias

- Los limites entre modulos deben cuidarse mediante revision y estructura de carpetas.
- Las llamadas entre modulos deben pasar por servicios de aplicacion o eventos compartidos, no por accesos directos a persistencia de otros dominios.
- Se evita el costo operativo de un sistema distribuido hasta que exista una necesidad de negocio clara.
