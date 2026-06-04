# Contratos Iniciales de Endpoints

Estos contratos definen el objetivo de migracion. La implementacion de endpoints empieza en la Fase 2 y Fase 3.

## Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/login/mfa-verify`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/mfa/generate`
- `POST /api/v1/auth/mfa/enable`
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

Si el usuario tiene MFA activo, la respuesta no entrega tokens finales:

```json
{
  "mfaRequired": true,
  "tempToken": "jwt_temporal"
}
```

### `POST /api/v1/auth/login/mfa-verify`

Payload:

```json
{
  "tempToken": "jwt_temporal",
  "otp": "123456"
}
```

Si el OTP es valido, devuelve `accessToken`, `refreshToken` y `user`.

No existe registro publico de usuarios. La creacion de cuentas se realiza exclusivamente desde `POST /api/v1/admin/users`, protegido por rol `super_admin`.

### `POST /api/v1/auth/forgot-password`

Genera un token temporal de recuperacion con expiracion de 15 minutos y responde siempre con un mensaje generico. El token no se expone al navegador ni a la respuesta JSON; el backend envia un enlace a `/reset-password?token=...` mediante SMTP cuando `SMTP_HOST` y `SMTP_FROM` estan configurados.

```json
{
  "email": "usuario@nextaudit.local"
}
```

Respuesta:

```json
{
  "message": "Si el correo existe, se envio un enlace temporal para restablecer la contraseña."
}
```

### `POST /api/v1/auth/reset-password`

Payload:

```json
{
  "token": "token_temporal",
  "password": "NuevaClave123!"
}
```

La nueva contrasena debe cumplir la politica estricta: minimo 12 caracteres, mayuscula, minuscula, numero y simbolo.

### `POST /api/v1/auth/mfa/generate`

Requiere JWT. Genera `mfaSecret`, URL `otpauth://` y QR en `data:image/png;base64`.

### `POST /api/v1/auth/mfa/enable`

Requiere JWT. Activa MFA si el OTP de 6 digitos es valido.

```json
{
  "otp": "123456"
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

### `GET /api/v1/alerts`

Lista las alertas persistidas en `telemetry.alerts` para el tenant del JWT. Esta ruta alimenta el Live Feed del Dashboard.

## Actividad de n8n

- `GET /api/v1/activity/executions?limit=20`

Este endpoint es una fachada de solo lectura hacia n8n. El navegador no debe consultar `/rest/executions` ni almacenar cookies de n8n. El backend obtiene acceso mediante `N8N_API_KEY` o, en desarrollo local, mediante `N8N_EMAIL` y `N8N_PASSWORD`.

Control de acceso:

- `viewer`: permitido.
- `admin`: permitido.
- `super_admin`: permitido.

## Webhooks

- `POST /api/v1/webhooks/n8n/alerts`
- `POST /n8n-webhook` alias temporal para flujos antiguos de n8n.

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

Para el nodo HTTP Request de n8n, la URL recomendada en desarrollo es:

```text
http://host.docker.internal:3001/api/v1/webhooks/n8n/alerts
```

El alias temporal para workflows antiguos es:

```text
http://host.docker.internal:3001/n8n-webhook
```

Ambas rutas requieren el header `x-nextaudit-webhook-secret`.

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
- `PATCH /api/v1/admin/users/:userId`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/llm-keys`
- `POST /api/v1/admin/llm-keys`
- `DELETE /api/v1/admin/llm-keys/:id`

### `GET /api/v1/admin/users`

Lista los usuarios del tenant actual. Requiere rol `super_admin`.

### `POST /api/v1/admin/users`

Payload:

```json
{
  "email": "usuario@nextaudit.local",
  "displayName": "Usuario Local",
  "password": "Temporal123!",
  "role": "viewer",
  "isActive": true
}
```

Roles validos:

- `viewer`: puede ver datos, pero no puede usar IA.
- `admin`: puede ver datos y usar IA.
- `super_admin`: puede administrar usuarios, llaves y controles internos.

### `PATCH /api/v1/admin/users/:userId`

Permite cambiar `displayName`, `role` e `isActive` para usuarios del tenant actual. Requiere rol `super_admin`.
