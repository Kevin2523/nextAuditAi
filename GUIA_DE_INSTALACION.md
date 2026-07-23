# Guía de Instalación — NextAudit AI

## Requisitos

- Node.js >= 20
- Docker Desktop (para PostgreSQL y Redis)
- npm >= 10

---

## 1. Clonar e ingresar

```bash
git clone https://github.com/tu-usuario/nextAuditAi.git
cd nextAuditAi
```

---

## 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` y cambia al menos:
- `JWT_ACCESS_SECRET` — una clave aleatoria segura (mín. 32 caracteres)
- `N8N_WEBHOOK_SECRET` — otra clave aleatoria
- `DATABASE_URL` — si tu PostgreSQL no corre en `localhost:5432`

---

## 3. Levantar base de datos

```bash
docker compose -f backend/ops/compose/compose.dev.yml up -d
```

Esto levanta PostgreSQL y Redis. Para verificar:

```bash
docker ps
```

Debes ver los contenedores `nextaudit-postgres` y `nextaudit-redis` en estado `Up`.

---

## 4. Instalar dependencias

```bash
cd backend
npm ci
```

---

## 5. Migrar base de datos

```bash
npx prisma migrate deploy
```

Esto aplica las migraciones existentes y crea las tablas en los esquemas `core`, `iam` y `telemetry` de PostgreSQL.

---

## 6. Sembrar datos iniciales

```bash
npx ts-node prisma/seed/baseline.ts
npx ts-node prisma/seed/dev-user.ts
```

El seed `baseline.ts` crea:
- Un tenant predeterminado (`NextAudit Local`)
- 3 roles: `viewer`, `admin`, `super_admin`
- 7 permisos base
- Asignaciones rol–permiso

El seed `dev-user.ts` crea:
- Un usuario administrador con las credenciales definidas en `DEV_USER_EMAIL` y `DEV_USER_PASSWORD` del `.env`
- Su membresía en el tenant con rol `super_admin`

---

## 7. Iniciar backend

```bash
npx nest start api
```

El servidor arranca en `http://localhost:3001`. La documentación Swagger está en:

```
http://localhost:3001/api/docs
```

---

## 8. Iniciar frontend

En otra terminal:

```bash
cd frontend/nextaudit-app
npm ci
npm run build    # o npx ng serve para desarrollo con live-reload
```

El frontend arranca en `http://localhost:4200`.

---

## 9. Verificar instalación

```bash
# Health check del backend
curl http://localhost:3001/api/v1/health

# Login con el usuario por defecto
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nextaudit.local","password":"NextAuditDev123!"}'
```

Si todo funciona, recibirás un `accessToken` y un `refreshToken`.

---

## Estructura del proyecto

```
nextAuditAi/
├── backend/                    # API NestJS (monorepo workspace)
│   ├── apps/api/src/           # Código fuente de la API
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de datos
│   │   ├── migrations/         # Migraciones SQL
│   │   └── seed/               # Scripts de seed
│   ├── ops/                    # Docker, scripts, Dockerfiles
│   └── .env.example            # Template de variables de entorno
├── frontend/
│   └── nextaudit-app/          # Aplicación Angular
├── src/ai-sentinel/            # Docker Compose de servicios adicionales
├── .github/workflows/          # Pipeline CI (DevSecOps)
└── documentos para entregas/   # Documentación académica
```

---

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run build` | Compila backend + worker |
| `npm run start:api` | Inicia API NestJS |
| `npm run start:dev:api` | Inicia API con watch mode |
| `npm run lint` | ESLint en todo el backend |
| `npm run prisma:generate` | Regenera cliente Prisma |
| `npm run prisma:migrate:dev` | Crea nueva migración |
| `npx ng serve` | Inicia frontend Angular |
| `docker compose down` | Detiene contenedores |

---

## Solución de problemas

**Error: `ECONNREFUSED` al conectar a PostgreSQL**
→ Verifica que Docker Desktop esté corriendo y ejecuta `docker ps` para confirmar que postgres está levantado.

**Error: `PrismaClientInitializationError`**
→ Ejecuta `npx prisma generate` para regenerar el cliente Prisma después de cambios en el schema.

**Error: `JWT_ACCESS_SECRET is not configured`**
→ Asegúrate de haber copiado `backend/.env.example` a `backend/.env` y de haber puesto un valor en `JWT_ACCESS_SECRET`.

**Error: 401 en login**
→ Usa las credenciales del seed: `admin@nextaudit.local` / `NextAuditDev123!` (o las que definiste en `DEV_USER_EMAIL`/`DEV_USER_PASSWORD`).
