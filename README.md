# NextAudit AI

> SaaS de auditoria inteligente para flotas y endpoints con una arquitectura cyber-industrial: automatizacion, trazabilidad y cumplimiento continuo.

## Vision

NextAudit AI transforma telemetria tecnica en decisiones auditables para equipos de TI, seguridad y operaciones. El objetivo es convertir una flota distribuida en una superficie observable, gobernable y lista para cumplir politicas internas o regulatorias.

## Arquitectura de Microservicios

- FleetDM: inventario, postura y visibilidad de endpoints.
- n8n: orquestacion de flujos de auditoria y automatizaciones.
- Flowise: capa de IA aplicada a analisis y asistencia operativa.
- PostgreSQL/MySQL/Redis: persistencia operacional y metadatos.
- Docker Compose: despliegue reproducible para desarrollo, pruebas y produccion.

## Quick Deploy con Docker

1. Clonar repositorio y entrar al proyecto.
2. Copiar variables de entorno de ejemplo segun el entorno (`dev.env.example`, `test.env.example`, `prod.env.example`).
3. Levantar stack:

```bash
docker compose -f src/ai-sentinel/docker-compose.dev.yml up -d
```

4. Verificar servicios principales (`fleet`, `n8n`, `flowise`, `postgres`, `mysql`, `redis`).

## Estructura de Ramas

- `main`: base estable minima (README, `.gitignore`, compose basico).
- `develop`: codigo completo migrado y evolucion activa del SaaS.
- `docs`: documentacion tecnica, manuales y guias operativas.

## Estado del Proyecto

NextAudit AI se encuentra en fase de evolucion hacia producto SaaS, priorizando:

- observabilidad de flota en tiempo real,
- auditoria automatizada por politicas,
- integracion de IA para analisis y respuesta asistida.

## Licencia

Pendiente de definicion para la etapa comercial de NextAudit AI.