# Pruebas de Estres JMeter - NextAuditAI

## Requisitos

1. **JMeter 5.6.x** (portable, no requiere instalacion)
   - Ya instalado en `C:\NextAuditAI\apache-jmeter-5.6.3\`
   - Si no existe, descargar: https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-5.6.3.zip
   - Extraer en `C:\NextAuditAI\apache-jmeter-5.6.3\`

2. **Backend NestJS encendido** en `http://localhost:3001`
3. **Docker con los servicios** (PostgreSQL, Fleet, Redis, etc.) corriendo

## Estructura

```
Pruebas de estres Jmeter/
  ├── prueba_estres.jmx       ← Plan de JMeter
  ├── resultados/             ← Se genera al ejecutar la prueba
  │   ├── prueba_estres.csv   ← Datos crudos
  │   └── reporte_html/       ← Dashboard visual (index.html)
  └── README.md
```

## Como ejecutar

Abrir **PowerShell** en la carpeta `backend/Pruebas/Pruebas de estres Jmeter/`:

### Opcion 1: Solo datos CSV (mas rapido)

```powershell
C:\NextAuditAI\apache-jmeter-5.6.3\bin\jmeter.bat -n -t prueba_estres.jmx -l resultados\prueba_estres.csv
```

### Opcion 2: Con reporte HTML completo (recomendado)

Ejecuta la prueba y al finalizar genera automaticamente el dashboard:

```powershell
C:\NextAuditAI\apache-jmeter-5.6.3\bin\jmeter.bat -n -t prueba_estres.jmx -l resultados\prueba_estres.csv -e -o resultados\reporte_html
```

Luego abrir `resultados/reporte_html/index.html` en el navegador.

> **Nota:** La carpeta `resultados/reporte_html/` NO existe antes de ejecutar. JMeter la crea automaticamente al finalizar la prueba cuando se usan los flags `-e -o`.

### Opcion 3: Generar HTML desde un CSV existente (sin repetir la prueba)

Si ya tienes un CSV de una ejecucion anterior:

```powershell
C:\NextAuditAI\apache-jmeter-5.6.3\bin\jmeter.bat -g resultados\prueba_estres.csv -o resultados\reporte_html
```

### Opcion 4: Abrir en JMeter GUI (para debug/editar)

```powershell
C:\NextAuditAI\apache-jmeter-5.6.3\bin\jmeter.bat -t prueba_estres.jmx
```

## Parametros del test

| Variable | Valor | Significado |
|---|---|---|
| `USERS` | 100 | Maximo de usuarios virtuales |
| `RAMP_UP` | 300s | Tiempo para alcanzar los 100 usuarios |
| `DURATION` | 420s | Duracion total del test (7 min) |
| `DEV_EMAIL` | admin@nextaudit.local | Email para login |
| `DEV_PASSWORD` | NextAuditDev123! | Password para login |

### Perfil de carga progresiva

```
Tiempo   | Usuarios activos
---------|-----------------
0s       | 0
30s      | ~10
60s      | ~20
120s     | ~40
180s     | ~60
240s     | ~80
300s     | 100   ← pico
420s     | 0     ← fin
```

## Endpoints probados

| Endpoint | Tipo | Requiere Auth |
|---|---|---|
| `POST /api/v1/auth/login` | Autenticacion | No |
| `GET /api/v1/health` | Health Check | No |
| `GET /api/v1/alerts` | Lectura | Si |
| `GET /api/v1/fleet/hosts` | Lectura | Si |
| `GET /api/v1/fleet/vulnerabilities` | Lectura | Si |
| `GET /api/v1/admin/users` | Lectura | Si |
| `GET /api/v1/auth/passkey` | Lectura | Si |
| `POST /api/v1/fleet/sync` | Escritura | Si |

## Notas

- Cada hilo (usuario virtual) hace login **una sola vez** al iniciar y reusa el token JWT
- Entre peticiones hay un **think time aleatorio** de 1-5s para simular comportamiento real
- Si falla el login, el resto de peticiones se saltan (error 401)
- La prueba dura **7 minutos** (420s) por defecto
- Los resultados quedan en `resultados/prueba_estres.csv` para importar a Excel/Grafana
- El reporte HTML se genera automaticamente al usar `-e -o` al final de la ejecucion
