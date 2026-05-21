# Fachada de Integracion

La Fase 3 mueve el consumo directo de FleetDM y Flowise desde Angular hacia el backend NestJS. El objetivo es que el navegador use rutas estables de NextAudit y que las credenciales de integraciones vivan solo en backend.

## Rutas Estables

- FleetDM: `/api/v1/fleet`
- IA/Flowise: `/api/v1/ai`

## Variables de Entorno

FleetDM:

```text
FLEET_BASE_URL=https://localhost:1337
FLEET_TLS_REJECT_UNAUTHORIZED=false
FLEET_API_TOKEN=
FLEET_EMAIL=
FLEET_PASSWORD=
```

Flowise:

```text
FLOWISE_BASE_URL=http://localhost:3000
FLOWISE_CHATFLOW_ID=edf621f0-daf7-4516-adbf-8fc6f48c31f3
FLOWISE_API_KEY=
```

## Regla de Seguridad

Angular no debe almacenar tokens de Fleet, credenciales de n8n, identificadores sensibles de Flowise ni llaves de proveedores LLM. El frontend solo consume la API de NextAudit mediante el proxy local.

## Proxy Angular

El archivo `frontend/nextaudit-app/proxy.conf.json` redirige `/api` hacia `http://localhost:3001`, que corresponde al backend NestJS. Esto evita CORS en desarrollo y mantiene rutas transparentes para la aplicacion Angular.
