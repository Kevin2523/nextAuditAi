# Guía rápida de uso (AI Stack + Fleet)

Antes de levantar el stack con `docker compose`, hay 3 cosas importantes que debes tener en cuenta:

---

## 1) Certificados TLS (carpeta `certs/`)

Debes generar los certificados TLS dentro de la carpeta `certs/` **antes** de levantar el compose.

📌 Sigue las instrucciones del archivo `.md` que está dentro de `certs/`.

---

## 2) Dominio / IP usada en los certificados (MUY IMPORTANTE)

Cuando generes los certificados TLS, vas a definir un `CN` con un **dominio o IP**.

Ese valor será importante porque:

- Será la dirección desde donde podrás acceder a Fleet (UI/API).
- Será la dirección a la que los instaladores generados por Fleet intentarán conectarse (enroll).
- Será la dirección que los endpoints con `osquery` usarán para conectarse al servidor.

---

### Caso A: Usar `localhost`
Si generas certificados con `localhost`:

✅ Podrás acceder a Fleet desde el mismo servidor fácilmente.  
❌ Pero los endpoints (otras máquinas) **nunca podrán conectarse** a Fleet, porque para ellos `localhost` significa “ellos mismos”.

---

### Caso B: Usar un dominio o IP real
Si generas certificados con un dominio custom (ej: `fleet.midominio.com`) o con la IP pública del servidor:

✅ El servidor podrá exponer Fleet correctamente.  
✅ Los endpoints podrán conectarse y enrollarse sin problema.

📌 Importante:
- El servidor donde levantes el compose debe resolver ese dominio hacia su propia IP.
- Los endpoints también deben resolver ese dominio hacia la IP actual del servidor.

Esto se puede lograr con:
- DNS público (Cloudflare, etc.)
- o entradas en el archivo `hosts` (solo para pruebas).

---

## 3) Producción: cambiar la llave privada de Fleet

En el archivo `.env` existe una variable llamada:

`FLEET_SERVER_PRIVATE_KEY`

Por defecto puede venir con un valor "demo" para que el stack levante sin problemas.

⚠️ **Si vas a usar esto en producción, debes cambiar esta llave.**

Puedes generar una llave segura con:

```bash
openssl rand -base64 32
