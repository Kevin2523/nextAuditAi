# ADR-003: Mover Fleet, Flowise y n8n detras de la API SaaS

## Estado

Aceptado

## Contexto

El frontend actual accede a Fleet y Flowise casi de forma directa, y n8n envia alertas a un bridge en memoria. Esto funciona en local, pero no es seguro para SaaS porque el manejo de credenciales, el control de costos, el aislamiento por tenant y la auditoria quedan debiles.

## Decisión

El navegador debe llamar solo a `NextAudit API`. FleetDM, Flowise, n8n, Ollama y proveedores LLM externos pasan a ser integraciones del backend.

## Consecuencias

- Los tokens de Fleet y endpoints de Flowise no se exponen al navegador.
- n8n envia alertas a webhooks autenticados del backend.
- Las alertas se persisten en PostgreSQL y opcionalmente se procesan por cola.
- Las API keys LLM se gobiernan solo desde modulos backend.
- El bridge anterior puede retirarse cuando Angular y n8n migren a los nuevos contratos.
