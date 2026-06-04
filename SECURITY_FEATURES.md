# Funcionalidades de Seguridad - NextAudit AI

Este documento describe detalladamente las funcionalidades de seguridad y control de acceso que han sido implementadas y perfeccionadas recientemente en la plataforma **NextAudit AI**.

---

## 1. Recuperación y Restablecimiento de Contraseñas (Forgot/Reset Password)

El sistema permite a los usuarios recuperar el acceso a su cuenta mediante el envío de enlaces temporales seguros a través de correo electrónico.

### ¿Cómo funciona?
1. **Solicitud de Enlace:** El usuario ingresa su correo en la vista pública de recuperación.
2. **Generación de Token:** El backend (`AuthService.forgotPassword`) genera de forma segura un token temporal criptográfico de un solo uso utilizando el módulo `crypto` nativo de Node.js (32 bytes aleatorios codificados en base64url).
3. **Persistencia y Hash:** El token se guarda en la base de datos hasheado (SHA-256) junto con una fecha de expiración (15 minutos). Nunca se guarda en texto plano para mitigar riesgos en caso de filtración de la base de datos.
4. **Envío de Correo:** Utilizando `nodemailer` configurado con variables de entorno (`SMTP_HOST`, `SMTP_USER`, etc.), se envía un enlace único al usuario.
5. **Restablecimiento:** Al acceder al enlace, el usuario provee una nueva contraseña. El backend verifica la vigencia del token y lo compara utilizando el mismo algoritmo de hash, invalidándolo inmediatamente después de su uso exitoso.

---

## 2. Políticas Estrictas de Contraseña Segura

Para prevenir el uso de contraseñas débiles o vulnerables a ataques de diccionario, se ha implementado una validación estricta de formato tanto en el Backend como en el Frontend.

### ¿Cómo funciona?
* Se utiliza una expresión regular (Regex) en los Data Transfer Objects (DTO) y en los validadores reactivos de Angular:
  `export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;`
* **Requisitos:**
  * Mínimo de **12 caracteres** de longitud.
  * Al menos **una letra mayúscula** (`A-Z`).
  * Al menos **una letra minúscula** (`a-z`).
  * Al menos **un número** (`0-9`).
  * Al menos **un carácter especial o símbolo** (`!@#$%^&*...`).
* **Nota Técnica:** Esta validación es omitida a propósito en el proceso de **Login**. Durante el inicio de sesión, cualquier intento de contraseña, incluso las que no cumplen la política, se procesa para registrar los intentos fallidos, mejorando así la efectividad de la protección contra fuerza bruta.

---

## 3. Autenticación de Dos Pasos (MFA / TOTP)

Añade una capa secundaria de validación utilizando contraseñas de un solo uso basadas en tiempo (TOTP).

### ¿Cómo funciona?
1. **Activación Inicial:** 
   * El usuario solicita activar MFA desde su Dashboard. 
   * El backend genera un secreto OTP único y devuelve un código QR usando un estándar `otpauth://`.
   * El usuario escanea el QR utilizando una aplicación como Google Authenticator o Authy.
   * El usuario ingresa el primer código de 6 dígitos generado por la App para confirmar y activar la funcionalidad permanentemente en la base de datos.
2. **Proceso de Login:**
   * Al hacer Login, el sistema valida las credenciales. Si el usuario tiene MFA activado, el backend devuelve un código de estado especial (`mfaRequired: true`) junto con un `tempToken` (JWT de corta duración).
   * El frontend intercepta este estado y en lugar de iniciar sesión, cambia a la vista de ingreso de código OTP.
   * El usuario ingresa su código de 6 dígitos actual.
   * El backend utiliza el `tempToken` y el código de 6 dígitos para validar el OTP contra el secreto almacenado. Si es correcto, emite los Access Tokens definitivos.

---

## 4. Protección Contra Fuerza Bruta (Account Lockout)

Evita que atacantes automatizados o scripts intenten adivinar contraseñas mediante la prueba de múltiples combinaciones en poco tiempo.

### ¿Cómo funciona?
1. **Contador de Intentos:** Cada vez que el servidor recibe una solicitud de login válida pero la contraseña no coincide con el hash del usuario, se incrementa el campo `failedLoginAttempts` en la base de datos.
2. **Límite Excedido:** Si el contador alcanza el `MAX_FAILED_LOGIN_ATTEMPTS` (actualmente configurado en 5 intentos fallidos consecutivos).
3. **Bloqueo Temporal:** El sistema actualiza el campo `lockedUntil` estableciendo una fecha futura (`Date.now() + 15_000` ms, es decir, 15 segundos para pruebas, ajustable en producción a 15-30 minutos).
4. **Rechazo Inmediato:** Cualquier intento de inicio de sesión mientras `lockedUntil` esté activo será rechazado inmediatamente con un código HTTP `423 Locked`, mostrando un mensaje al usuario.
5. **Reinicio del Contador:** Una vez que el tiempo de bloqueo expira, si el usuario falla nuevamente, el contador se reinicia a 1. Si el usuario ingresa correctamente, el contador se restablece a 0 y la fecha de bloqueo se limpia.
