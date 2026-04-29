# Certificados TLS para Fleet

En esta carpeta se generan los certificados TLS requeridos por Fleet.

## Requisito

- `openssl` instalado en el host donde preparas los certificados.

## Generar certificados self-signed

Ejecuta desde la raiz del proyecto:

```bash
mkdir -p src/ai-sentinel/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout src/ai-sentinel/certs/fleet.key \
  -out src/ai-sentinel/certs/fleet.crt \
  -subj "/CN=<FQDN_O_IP>"
```

Reemplaza `<FQDN_O_IP>` por el dominio o IP real del servidor Fleet.

## Permisos recomendados

```bash
chmod 600 src/ai-sentinel/certs/fleet.key
chmod 644 src/ai-sentinel/certs/fleet.crt
```