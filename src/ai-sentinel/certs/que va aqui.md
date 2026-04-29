# Certificados TLS para Fleet

En esta carpeta se generan los certificados TLS necesarios para **Fleet**.

⚠️ **Importante:** estos certificados deben crearse **antes** de levantar el `docker-compose.yml`, ya que Fleet monta los archivos desde `./certs/`.

---

## Requisitos
- Servidor Linux con `openssl` instalado.

---

## Generar certificados (self-signed)

Ejecuta estos comandos desde la raíz del proyecto:

```bash
mkdir -p certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/fleet.key \
  -out certs/fleet.crt \
  -subj "/CN=<FQDN_OR_IP>"

```
⚠️ **Importante:**

Reemplaza <FQDN_OR_IP> por el dominio o IP del servidor donde se levantará Fleet, posteriorment osquery apuntara alli.

Ejemplo:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/fleet.key \
  -out certs/fleet.crt \
  -subj "/CN=mi-servidor.com"
```

## Darle permisos (recomendado)
```bash
chmod 644 certs/fleet.key certs/fleet.crt
```
