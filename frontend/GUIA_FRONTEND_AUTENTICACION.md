# Guia de Autenticacion Frontend

La aplicacion Angular usa autenticacion SaaS real contra `POST /api/v1/auth/login`.

## Estado Reactivo

El servicio `AuthService` mantiene el estado con Angular Signals:

- `claimsSignal`: claims decodificados del JWT.
- `currentUserSignal`: usuario actual con `id`, `email`, `role` y `tenantId`.
- `isAuthenticated`: indica si existe una sesion valida en memoria.
- `canUseAi`: habilita funciones IA para `admin` y `super_admin`.

## Manejo de Tokens

- Access Token: se mantiene solo en memoria mediante Signal.
- Refresh Token: se mantiene solo en memoria mientras no exista cookie segura emitida por backend.

La opcion recomendada para produccion es mover el refresh token a una cookie `HttpOnly`, `Secure` y `SameSite`, emitida por el backend. No se implementa aqui porque los contratos backend ya estan estables para esta fase.

## Interceptor HTTP

El interceptor agrega automaticamente:

```text
Authorization: Bearer <token>
```

solo en peticiones hacia `/api/v1/*`, excluyendo `/api/v1/auth/login`.

## Requisitos para Iniciar Sesion en Desarrollo

El frontend en `localhost:4200` usa `proxy.conf.json` para enviar `/api` al backend NestJS en `localhost:3001`. Antes de ingresar desde la pantalla de login, el backend debe estar levantado.

Pasos minimos:

```powershell
cd backend
npm run prisma:migrate:deploy
npm run seed:dev-user
npm run start:api
```

Credenciales locales por defecto:

```text
admin@nextaudit.local
NextAuditDev123!
```

Si el navegador muestra error 500 en `/api/v1/auth/login`, normalmente significa que el proxy de Angular no puede comunicarse con el backend o que el backend no tiene variables `.env` cargadas.

## Guards

- `authGuard`: protege las rutas internas.
- `roleGuard`: restringe rutas por rol.

La ruta `/assistant` solo permite `admin` y `super_admin`.

## Visibilidad en UI

El Dashboard usa directivas `@if` vinculadas al Signal de autenticacion para ocultar elementos de IA/mantenimiento cuando el rol es `viewer`.
