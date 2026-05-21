# Contratos Iniciales de Endpoints

Estos contratos definen el objetivo de migracion. La implementacion de endpoints empieza en la Fase 2 y Fase 3.

## Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### `POST /api/v1/auth/login`

Payload:

```json
{
  "email": "admin@nextaudit.local",
  "password": "NextAuditDev123!"
}
```

Respuesta:

```json
{
  "accessToken": "jwt",
  "refreshToken": "token_opaco",
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "email": "admin@nextaudit.local",
    "displayName": "Administrador Local",
    "role": "super_admin",
    "tenantId": "uuid"
  }
}
```

Claims obligatorios del JWT:

- `sub`: id del usuario.
- `email`: email del usuario.
- `role`: `viewer`, `admin` o `super_admin`.
- `tenant_id`: id del tenant activo.

## Fachada de Lectura de Fleet

- `GET /api/v1/fleet/hosts`
- `GET /api/v1/fleet/vulnerabilities`
- `POST /api/v1/fleet/sync`

Estos endpoints son intermediarios seguros hacia FleetDM. El navegador no debe enviar ni almacenar tokens de Fleet. El backend obtiene el token mediante `FLEET_API_TOKEN` o mediante `FLEET_EMAIL` y `FLEET_PASSWORD`.

Control de acceso:

- `GET /api/v1/fleet/hosts`: `viewer`, `admin`, `super_admin`.
- `GET /api/v1/fleet/vulnerabilities`: `viewer`, `admin`, `super_admin`.
- `POST /api/v1/fleet/sync`: `admin`, `super_admin`.

## Alertas

- `GET /api/v1/alerts`
- `GET /api/v1/alerts/:id`
- `PATCH /api/v1/alerts/:id/status`

## Actividad de n8n

- `GET /api/v1/activity/executions?limit=20`

Este endpoint es una fachada de solo lectura hacia n8n. El navegador no debe consultar `/rest/executions` ni almacenar cookies de n8n. El backend obtiene acceso mediante `N8N_API_KEY` o, en desarrollo local, mediante `N8N_EMAIL` y `N8N_PASSWORD`.

Control de acceso:

- `viewer`: permitido.
- `admin`: permitido.
- `super_admin`: permitido.

## Webhooks

- `POST /api/v1/webhooks/n8n/alerts`

Las solicitudes entrantes desde n8n deben incluir el header:

```text
x-nextaudit-webhook-secret: valor_de_N8N_WEBHOOK_SECRET
```

Durante la migracion, el payload conserva compatibilidad con los campos actuales del bridge:

```json
{
  "dispositivo": "HOST-001",
  "mensaje": "Critical finding",
  "severidad": "critical",
  "timestamp": "2026-05-19T14:00:00.000Z"
}
```

El backend normaliza este payload y lo persiste en `telemetry.alerts`. Si no se envia `tenantId`, usa `DEFAULT_TENANT_ID`, que en desarrollo apunta al tenant local sembrado por la migracion inicial.

## Chat de IA

- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/remediation`
- `POST /api/v1/ai/reports`

Estos endpoints se deniegan para `viewer`.

Durante Fase 3, estos endpoints actuan como fachada hacia Flowise. El navegador no conoce `FLOWISE_BASE_URL`, `FLOWISE_CHATFLOW_ID` ni `FLOWISE_API_KEY`.

Control de acceso:

- `viewer`: bloqueado.
- `admin`: permitido.
- `super_admin`: permitido.

## Super Admin

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/role`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/llm-keys`
- `POST /api/v1/admin/llm-keys`
- `DELETE /api/v1/admin/llm-keys/:id`
