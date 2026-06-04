# Guion de Presentación: Funcionalidades de Seguridad en NextAudit AI

**Audiencia:** Equipo técnico, stakeholders, o evaluadores de seguridad.
**Duración estimada:** 5 - 7 minutos.

---

## 1. Introducción (1 minuto)

**[Presentador]**
"Hola a todos. Hoy quiero presentarles las nuevas capas de seguridad que hemos implementado en la plataforma NextAudit AI. Al ser un sistema que maneja datos de dispositivos y alertas de auditoría, garantizar la protección de las cuentas de nuestros usuarios es una prioridad absoluta. Para lograrlo, hemos incorporado un esquema de defensa en profundidad compuesto por cinco pilares fundamentales. Vamos a verlos uno por uno."

---

## 2. Prevención en la Entrada: Políticas de Contraseña (1 minuto)

**[Presentador]**
"El primer paso para evitar vulnerabilidades es asegurar que la 'llave' sea fuerte. Hemos implementado una **política estricta de contraseñas**.

*   **¿Cómo funciona?** Cuando un usuario se registra o cambia su contraseña, el sistema no acepta contraseñas genéricas. Exigimos un mínimo de 12 caracteres, forzando la combinación de mayúsculas, minúsculas, números y al menos un símbolo especial.
*   **Experiencia de Usuario (UX):** Para no frustrar al usuario, construimos una interfaz dinámica. A medida que el usuario teclea su nueva clave, una lista de validadores se va iluminando en verde en tiempo real, dándole feedback instantáneo sobre qué requisitos le faltan cumplir. Si la contraseña no es criptográficamente segura, el botón de guardado simplemente no se habilita."

---

## 3. Defensa Activa: Protección contra Fuerza Bruta (1 minuto)

**[Presentador]**
"¿Qué pasa si un atacante utiliza un bot para intentar adivinar una contraseña probando miles de combinaciones por segundo? Aquí es donde entra nuestra **protección contra fuerza bruta**.

*   **¿Cómo funciona?** El backend lleva un registro silencioso de los intentos fallidos. Si un usuario (o atacante) ingresa credenciales incorrectas 5 veces seguidas, el sistema corta la conexión y **bloquea la cuenta temporalmente**.
*   Durante el tiempo de bloqueo (actualmente configurado en segundos para pruebas, pero escalable en producción), cualquier intento de inicio de sesión es rechazado inmediatamente por el servidor con un código de error de seguridad (HTTP 423 Locked). Esto hace que los ataques de diccionario sean computacionalmente inviables."

---

## 4. Recuperación Segura: Restablecimiento por Correo (1.5 minutos)

**[Presentador]**
"Es común que los usuarios olviden sus credenciales. Diseñamos un flujo de **recuperación de contraseña** que es amigable pero impenetrable.

*   **¿Cómo funciona?** Si olvidas tu clave, el sistema genera de forma segura un token temporal criptográfico de un solo uso en el backend. Este token se guarda cifrado (hasheado) en la base de datos y expira automáticamente en 15 minutos.
*   Inmediatamente, nuestro servicio de mensajería (integrado con Nodemailer) envía un correo electrónico profesional y con el diseño corporativo de NextAudit AI directamente a la bandeja del usuario.
*   Al hacer clic, el usuario es llevado a la vista de creación de nueva clave. Una vez usada, la URL se autodestruye, previniendo ataques de reutilización."

---

## 5. El Escudo Adicional: Autenticación de Dos Pasos (MFA / 2FA) (1 minuto)

**[Presentador]**
"Aun si una contraseña fuera comprometida, tenemos un escudo adicional: **Multi-Factor Authentication (MFA)**.

*   **¿Cómo funciona?** Desde su Dashboard, el usuario puede habilitar MFA. El sistema genera un secreto cifrado y muestra un Código QR.
*   El usuario lo escanea con aplicaciones como Google Authenticator o Authy. Desde ese momento, para iniciar sesión, no solo necesita su correo y contraseña, sino también ingresar el código rotativo de 6 dígitos que cambia cada 30 segundos en su teléfono.
*   Además, le dimos el control total al usuario, permitiéndole desactivar esta función desde su panel si cambia de dispositivo móvil."

---

## 6. Protección de Perímetro: Cierre por Inactividad (1 minuto)

**[Presentador]**
"Finalmente, ¿qué ocurre si un usuario legítimo inicia sesión pero deja su computadora desbloqueada y se va a tomar un café? Para evitar accesos físicos no autorizados, desarrollamos un **Cierre de Sesión por Inactividad**.

*   **¿Cómo funciona?** Inyectamos un servicio de monitoreo en el navegador que supervisa los eventos de teclado, clics y movimiento del ratón.
*   Si el sistema detecta que el usuario no ha interactuado con la plataforma durante 10 minutos seguidos, asume que el equipo está desatendido.
*   De inmediato, destruye los tokens de acceso locales, cierra la sesión forzosamente y devuelve al usuario a la pantalla de login con una advertencia en rojo indicando que la sesión expiró por inactividad."

---

## 7. Conclusión (30 segundos)

**[Presentador]**
"En resumen, hemos construido una fortaleza digital. Protegemos al usuario desde el momento en que crea su clave, neutralizamos ataques automatizados, aseguramos la recuperación de accesos, garantizamos que el usuario sea quien dice ser mediante su teléfono, y cerramos las puertas si el sistema queda desatendido. Con NextAudit AI, los datos están seguros. Muchas gracias."
