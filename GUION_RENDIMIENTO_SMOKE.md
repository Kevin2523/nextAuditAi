# Guion de Presentación: Dashboard de Prueba de Humo (api.smoke.js)

**Audiencia:** Equipo de desarrollo, QA, o stakeholders.
**Duración estimada:** 3 - 5 minutos.
**Contexto del Dashboard:** Resultados de la ejecución de `api.smoke.js` en Grafana Cloud (K6).

---

## 1. Introducción: ¿Qué es una Prueba de Humo y por qué la ejecutamos? (1 minuto)

**[Presentador]**
"Hola a todos. Hoy les voy a explicar los resultados de nuestra prueba de humo, representada por el script `api.smoke.js`. 

Antes de someter a nuestra plataforma NextAudit AI a cargas masivas o pruebas de estrés intensas, realizamos lo que llamamos una **Prueba de Humo (Smoke Test)**. El objetivo principal no es medir la capacidad límite del servidor, sino realizar una verificación rápida y superficial para asegurar que el sistema esté 'vivo', que las rutas principales de la API respondan correctamente y que no haya errores de configuración básicos en el despliegue. Básicamente, comprobar que 'no sale humo' al encender el servicio."

---

## 2. Métricas Globales: Salud y Rapidez (1 minuto)

**[Presentador]**
"Si observamos el panel superior del dashboard, podemos ver cuatro métricas clave que resumen el estado general de la prueba:

*   **Usuarios Concurrentes (1 VU):** Como es una prueba de verificación sanitaria y no de carga, se ejecuta con un único usuario virtual (1 VU). Esto nos permite aislar el rendimiento puro de la base de datos y del servidor sin interferencias de concurrencia.
*   **Tiempo de Respuesta Promedio (21.5 ms):** La latencia promedio de todo el set de pruebas fue de apenas 21.5 milisegundos. Al no tener competencia por recursos, el servidor responde casi instantáneamente, lo cual demuestra una excelente base de rendimiento.
*   **Consultas Fallidas (0 req/s / Tasa de Fallos del 0%):** Lo más importante: no se registró un solo fallo. El panel de consultas fallidas está en verde brillante, lo que nos indica que el 100% de las peticiones fueron exitosas."

---

## 3. Cumplimiento de Hitos (SLA) (1 minuto)

**[Presentador]**
"En la sección inferior izquierda, bajo el panel de **Hitos**, definimos los indicadores mínimos de éxito (nuestros acuerdos de nivel de servicio o SLAs) para dar la prueba por aprobada.
Como pueden ver, los cuatro hitos principales alcanzaron una **tasa de éxito del 100%**, habiendo completado 9 ejecuciones exitosas de cada uno sin fallos:

1.  **admin users endpoint returns:** Verificamos que la ruta de administración responda correctamente.
2.  **health endpoint returns 200:** Confirmamos la ruta de estado de salud general.
3.  **login returns access token:** Garantizamos que el flujo de autenticación devuelva el token JWT de acceso.
4.  **fleet endpoint returns 200:** Validamos la respuesta del módulo de flota de dispositivos.

El éxito absoluto en estos hitos nos da la luz verde operativa."

---

## 4. Análisis Detallado de Endpoints (1 minuto)

**[Presentador]**
"Finalmente, en la tabla de **Endpoints** a la derecha, podemos ver el comportamiento individual de cada ruta bajo condiciones ideales. Aquí vale la pena destacar tres patrones muy claros y lógicos:

1.  **El Endpoint de Salud (`/api/v1/health`):** Con un recuento de 9 peticiones, obtuvo la latencia más baja de todo el sistema, con un P95 de **1.86 ms**. Es ultra rápido porque realiza una verificación básica del estado del servidor sin realizar consultas pesadas.
2.  **El Endpoint de Login (`/api/v1/auth/login`):** Tuvo un P95 de **105 ms**. Este tiempo es significativamente mayor que los de salud, lo cual es **esperado y seguro**. La autenticación utiliza algoritmos de hashing criptográfico (como bcrypt) para proteger las contraseñas, lo cual consume intencionalmente ciclos de CPU para prevenir ataques de fuerza bruta.
3.  **El Endpoint de Flota (`/api/v1/fleet/hosts`):** Registró un P95 de **275 ms** y un P99 de **409 ms**. Al ser el endpoint encargado de compilar información de múltiples hosts o bases de datos de dispositivos de flota, sus tiempos de respuesta son mayores de forma natural debido al volumen de datos consultado. Aun así, se mantiene muy por debajo del umbral de 1 segundo."

---

## 5. Conclusión (30 segundos)

**[Presentador]**
"En conclusión, los resultados de la prueba `api.smoke.js` son sumamente positivos. Hemos demostrado que las rutas críticas de NextAudit AI son funcionales, responden rápido bajo condiciones normales y no presentan errores de integración. Con este resultado sanitario aprobado, el sistema queda certificado y listo para pasar a fases más exigentes, como las pruebas de estrés y resistencia. 

Muchas gracias. Quedo abierto a cualquier duda que tengan."
