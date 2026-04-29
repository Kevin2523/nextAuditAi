# Guia rapida de uso (AI Stack + Fleet)

Antes de levantar el stack con `docker compose`, valida estos puntos.

## 1) Certificados TLS (`src/ai-sentinel/certs/`)

Genera los certificados TLS antes de iniciar los servicios.
Consulta `src/ai-sentinel/certs/que va aqui.md` para el procedimiento.

## 2) Dominio o IP de certificados

El `CN` del certificado debe ser un dominio o IP alcanzable por los endpoints.

- Si usas `localhost`, solo funcionara para pruebas locales en el mismo host.
- Para flota real, usa dominio o IP del servidor.

Asegura resolucion correcta en servidor y endpoints (DNS o archivo `hosts`).

## 3) Llave privada de Fleet en produccion

Define un valor seguro para `FLEET_SERVER_PRIVATE_KEY`.
No uses valores de demostracion en ambientes reales.

Ejemplo para generar una llave:

```bash
openssl rand -base64 32
```

## 4) Levantar entorno de desarrollo

```bash
docker compose -f src/ai-sentinel/docker-compose.dev.yml up -d
```

Luego valida estado de contenedores y salud de Fleet/n8n/Flowise.