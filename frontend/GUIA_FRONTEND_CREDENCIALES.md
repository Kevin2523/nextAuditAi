# Guia para configurar el frontend con credenciales locales

Esta guia explica que debe cambiar cada colaborador para que el frontend de NextAudit AI pueda conectarse a su stack local de Fleet y n8n.

## 1. Levantar el stack local

Desde la raiz del repo, levanta los servicios de desarrollo de `src/ai-sentinel` usando tu archivo `.env` local.

Verifica que estos servicios respondan:

- Fleet: `https://localhost:1337`
- n8n: `http://localhost:5678`
- Frontend Angular: `http://localhost:4200`

## 2. Configurar Fleet para el frontend

El frontend consume Fleet mediante el proxy Angular:

```txt
/api/v1/fleet/* -> https://localhost:1337/api/v1/fleet/*
```

Si tu Fleet no corre en `https://localhost:1337`, cambia el target en:

```txt
frontend/nextaudit-app/proxy.conf.json
```

## 3. Crear o conseguir un token de Fleet

Cada colaborador debe usar su propio token de Fleet. No se debe commitear un token personal.

Opcion recomendada:

1. Entra a Fleet en `https://localhost:1337`.
2. Inicia sesion con tu usuario administrador.
3. Ve a tu perfil.
4. Genera o copia tu API token.
5. Usa ese token para desarrollo local.

Opcion de desarrollo local con MySQL:

1. Identifica el usuario admin:

```powershell
docker exec ai-sentinel-mysql-1 mysql -ufleet -pfleet123 fleet -e "select id, name, email, global_role from users;"
```

2. Crea un token de sesion para ese usuario:

```powershell
$bytes = New-Object byte[] 64
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$token = [Convert]::ToBase64String($bytes)
docker exec ai-sentinel-mysql-1 mysql -ufleet -pfleet123 fleet -e "insert into sessions (user_id, ``key``) values (1, '$token');"
$token
```

3. Prueba el token:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
node -e "const token='TU_TOKEN'; fetch('https://localhost:1337/api/v1/fleet/hosts',{headers:{authorization:'Bearer '+token}}).then(async r=>{console.log(r.status); console.log(await r.text())})"
```

Debe responder `200`.

## 4. Usar el token en el frontend

Para desarrollo local, el token usado por el interceptor vive en `localStorage` con esta llave:

```txt
fleet_token
```

Puedes ponerlo desde DevTools:

```js
localStorage.setItem('fleet_token', 'TU_TOKEN');
location.reload();
```

Si el proyecto tiene un token fijo temporal en `FleetService`, reemplazalo localmente por tu token y evita subir ese cambio con credenciales personales.

Archivo relacionado:

```txt
frontend/nextaudit-app/src/app/services/fleet.service.ts
```

## 5. Configurar n8n si vas a usar actividad

El frontend intenta consultar n8n mediante:

```txt
/api/n8n/*
/rest/*
```

El proxy esta en:

```txt
frontend/nextaudit-app/proxy.conf.json
```

Si usas autenticacion de n8n, el token se guarda en:

```txt
n8n_token
```

## 6. Limpiar tokens cuando algo falle

Si Fleet devuelve `401`, limpia el token local y vuelve a generar uno:

```js
localStorage.removeItem('fleet_token');
location.reload();
```

## 7. Ejecutar frontend

Desde `frontend/nextaudit-app`:

```powershell
npm.cmd install
npm.cmd start
```

Abre:

```txt
http://localhost:4200/inventory
```

Si Fleet esta autenticado correctamente, el inventario debe listar los hosts reales de Fleet.

## 8. Valores que cada colaborador debe revisar

- `frontend/nextaudit-app/proxy.conf.json`: URLs locales de Fleet y n8n.
- `fleet_token`: token API o sesion de Fleet en `localStorage`.
- `n8n_token`: token de n8n si aplica.
- Certificados locales de Fleet: deben coincidir con el host usado (`localhost`, `fleet.local` o IP local).
- Scripts en `src/ai-sentinel/tools`: ajustar dominio, enroll secret y rutas si se genera un instalador propio.

