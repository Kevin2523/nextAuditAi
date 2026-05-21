# Backend de NextAudit AI

Este backend es la base SaaS de NextAudit AI. Esta estructurado como un monolito modular con NestJS y una aplicacion worker separada, para permitir crecimiento del producto sin convertir el entorno local en un sistema distribuido pesado.

## Aplicaciones

- `apps/api`: API HTTP para Angular, webhooks de n8n, fachada de Fleet, RBAC, gobierno de IA y operaciones administrativas.
- `apps/worker`: procesamiento en segundo plano para ingesta, sincronizacion, medicion de uso y trabajos asincronos.
- `packages/shared`: contratos, enumeraciones y eventos compartidos.

## Infraestructura Local

Levantar solo la capa de persistencia del backend:

```powershell
.\ops\scripts\dev-up.ps1
```

Detenerla:

```powershell
.\ops\scripts\dev-down.ps1
```

El compose de desarrollo del backend expone:

- PostgreSQL en `localhost:5433`
- Redis en `localhost:6380`

## Persistencia

El modelo de datos usa Prisma sobre PostgreSQL. La primera migracion crea esquemas separados para `core`, `iam` y `telemetry`, ademas de los esquemas reservados `audit`, `integration` y `billing`.

Comandos principales:

```powershell
npm run prisma:generate
npm run prisma:migrate:deploy
```

Para desarrollo local, `DATABASE_URL` debe apuntar a:

```text
postgresql://nextaudit:nextaudit_dev_password@localhost:5433/nextaudit
```

## Fachadas de Integracion

El backend expone rutas estables para que Angular no consuma FleetDM ni Flowise directamente:

- `/api/v1/fleet`: lectura de hosts, vulnerabilidades y sincronizacion.
- `/api/v1/ai`: chat, remediacion y reportes mediante Flowise.

Las credenciales y tokens de integracion se configuran mediante variables de entorno del backend.

## Arranque Local de la API

El frontend espera que la API SaaS este disponible en `http://localhost:3001`.

Preparacion minima:

```powershell
cd backend
copy .env.example .env
npm run prisma:migrate:deploy
npm run seed:dev-user
npm run start:api
```

Para evitar recompilacion en cada arranque, tambien puedes usar:

```powershell
npm run build
npm run start:api:prod
```

Mantén esta terminal abierta mientras uses Angular en `localhost:4200`; el proxy del frontend depende de que la API siga escuchando en `localhost:3001`.

Credenciales locales sembradas por defecto:

```text
admin@nextaudit.local
NextAuditDev123!
```

Un error 500 desde `localhost:4200/api/v1/auth/login` suele indicar que Angular si recibio la peticion, pero el proxy no pudo comunicarse correctamente con la API NestJS o la API no tiene configuradas sus variables de entorno.

## Siguientes Fases de Implementacion

1. Implementar `auth` con JWT de acceso y refresh tokens.
2. Conectar login real al modelo `user`, `membership`, `role` y `permission`.
3. Crear endpoints administrativos para usuarios, roles y auditoria.
4. Mover las llamadas de Angular a Fleet y Flowise detras de la fachada del backend.
5. Cambiar el workflow de n8n para enviar alertas a `POST /api/v1/webhooks/n8n/alerts`.
