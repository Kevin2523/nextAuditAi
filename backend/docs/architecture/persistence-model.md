# Modelo de Persistencia Inicial

La persistencia SaaS usa PostgreSQL con Prisma. La base local mantiene una sola instancia de PostgreSQL para reducir consumo en Docker/WSL2, pero separa responsabilidades mediante esquemas.

## Esquemas

- `core`: tenants y entidades base del SaaS.
- `iam`: usuarios, roles, permisos, membresias y refresh tokens.
- `telemetry`: alertas y hallazgos de seguridad.
- `audit`: reservado para auditoria de acciones del sistema.
- `integration`: reservado para integraciones y entregas de webhooks.
- `billing`: reservado para medicion de uso y monetizacion.

## Entidades Implementadas

- `core.tenants`
- `iam.users`
- `iam.roles`
- `iam.permissions`
- `iam.role_permissions`
- `iam.memberships`
- `iam.refresh_tokens`
- `telemetry.alerts`

## Seguridad de Contrasenas

Las contrasenas no se almacenan en texto plano. El servicio `UserPasswordService` usa `crypto.scrypt` con sal aleatoria y comparacion en tiempo constante. El formato guardado incluye algoritmo, parametros, sal y hash derivado.

## Usuario Local de Desarrollo

Para crear un usuario local de pruebas:

```powershell
npm run seed:dev-user
```

Valores por defecto:

- Email: `admin@nextaudit.local`
- Contrasena: `NextAuditDev123!`
- Rol: `super_admin`

Estos valores pueden cambiarse con `DEV_USER_EMAIL`, `DEV_USER_PASSWORD`, `DEV_USER_NAME` y `DEV_USER_ROLE`.

## Tenant Local

La migracion inicial crea el tenant local:

```text
00000000-0000-4000-8000-000000000001
```

Ese valor permite migrar n8n desde el bridge anterior sin exigir cambios inmediatos en todos los payloads.
