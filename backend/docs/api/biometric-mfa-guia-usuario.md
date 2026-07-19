# Guía de Autenticación Biométrica — NextAudit AI

## ¿Qué puedo usar para iniciar sesión?

NextAudit AI te permite elegir **cómo quieres iniciar sesión**. Puedes usar tu **correo y contraseña** de siempre, o si lo prefieres, puedes usar métodos más rápidos y seguros como tu **huella digital, reconocimiento facial o una llave USB de seguridad**.

| Método | ¿En qué dispositivos funciona? |
|---|---|
| **Huella digital** | Laptop con lector de huellas, celulares Android y iPhone, teclados con huella |
| **Reconocimiento facial (Face ID)** | iPhone, iPad, Mac con cámara TrueDepth, Windows Hello |
| **Windows Hello** | Laptops Windows con cámara o lector de huellas |
| **Llave USB de seguridad** | Cualquier computadora (YubiKey, Google Titan, etc.) |
| **Passkey sincronizada** | Se guarda en tu celular y funciona en cualquier dispositivo |

---

## ¿Cómo configuro Face ID, huella o una llave USB?

Es muy sencillo y solo toma unos segundos:

### Desde el Dashboard

1. Inicia sesión en NextAudit AI con tu correo y contraseña
2. Ve al **Dashboard**
3. Busca la sección llamada **"Passkeys / Biométricos"**
4. Haz clic en **"Registrar Face ID / Huella"**

Tu navegador te pedirá que uses tu huella, rostro o PIN (dependiendo de tu dispositivo). Sigue las instrucciones en pantalla.

> **Importante:** Si conectas una llave USB de seguridad (como una YubiKey), asegúrate de tenerla conectada antes de hacer clic en el botón. El sistema te pedirá que la toques para registrarla.

### ¿Qué pasa si mi dispositivo no tiene huella ni Face ID?

No hay problema. El sistema te permitirá:
- Usar el **PIN de tu dispositivo** (Windows Hello, celular, etc.)
- Conectar una **llave USB de seguridad** (YubiKey, Google Titan)
- Usar una **passkey guardada en tu celular** (se sincroniza automáticamente)

---

## ¿Cómo inicio sesión sin escribir mi contraseña?

Una vez que registraste tu huella, Face ID o llave USB:

1. Ve a la pantalla de inicio de sesión
2. Escribe tu **correo electrónico**
3. Haz clic en **"Face ID / Huella"** (al lado de "¿Olvidaste tu contraseña?")
4. Tu navegador te pedirá que uses tu huella, rostro, PIN o toques la llave USB

Y listo. Ya estás dentro sin haber escrito tu contraseña.

---

## ¿Puedo tener varios métodos registrados?

Sí. Puedes tener tantos como quieras:
- Tu huella en tu laptop
- Face ID en tu iPhone
- Una YubiKey USB
- Un PIN

Todos funcionan al mismo tiempo. Eliges cuál usar al momento de iniciar sesión.

---

## ¿Es seguro?

Sí, es **más seguro** que una contraseña tradicional porque:

- **Tu huella o rostro nunca salen de tu dispositivo.** Ni siquiera los enviamos a nuestros servidores.
- **No se pueden adivinar ni robar** como una contraseña.
- **Cada método está protegido por criptografía.** Es como tener una llave única e irrepetible.
- **Si pierdes tu dispositivo**, puedes eliminar ese método desde otro dispositivo con tu contraseña.

---

## ¿Qué hago si pierdo mi celular o laptop?

1. Inicia sesión desde otro dispositivo con tu **correo y contraseña**
2. Ve al **Dashboard > Passkeys / Biométricos**
3. Elimina el método del dispositivo que perdiste
4. Registra uno nuevo en tu dispositivo actual

Si no puedes iniciar sesión, contacta a tu administrador para que desactive los métodos antiguos.

---

## Preguntas frecuentes

### ¿Puedo usar huella en mi celular Android?

Sí. Android lo soporta de forma nativa en Chrome. Solo asegúrate de tener tu huella registrada en el sistema del celular.

### ¿Funciona en cualquier navegador?

Funciona en **Chrome, Edge, Safari y Firefox** (versiones recientes). En algunos navegadores muy antiguos puede no estar disponible, pero en ese caso siempre puedes usar tu correo y contraseña.

### ¿Puedo usar una YubiKey que ya tengo?

Sí. Cualquier llave USB que soporte FIDO2/FIDO Universal 2nd Factor (U2F) funciona. Conéctala, presiona el botón cuando el sistema lo pida, y listo.

### ¿Puedo desactivar todos los métodos biométricos y volver a solo contraseña?

Sí. Ve al Dashboard y elimina cada passkey registrada. Ahora solo podrás iniciar sesión con correo y contraseña.

### ¿El TOTP (código de 6 dígitos) sigue funcionando?

Sí. El MFA por TOTP (Google Authenticator, Authy) sigue funcionando exactamente igual. La autenticación biométrica es **independiente** del TOTP. Puedes usar ambos o solo uno.

---

*Si tienes dudas o problemas, contacta a tu administrador del sistema.*
