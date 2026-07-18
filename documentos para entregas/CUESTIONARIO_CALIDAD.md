# Cuestionario de Calidad - NextAudit AI

> **Leyenda:**
> - 🔵 **[Respuesta original]** = Respuesta proporcionada por el equipo (copiada textualmente).
> - 🟢 **[Respuesta elaborada por mí]** = Respuesta redactada por mí basada en el análisis del proyecto.
> - ⏳ **[Pendiente]** = Pendiente de respuesta por instrucción del equipo.

---

## Requisitos y Necesidades

### 1. ¿Qué requisitos explícitos (documentados) se cumplieron correctamente? ¿Cuáles no y por qué?

🔵 **Respuesta original:**

**Requisitos explícitos cumplidos**

- Política de contraseñas: valida longitud ≥ 12 y combina mayúsculas, minúsculas, números y símbolos.
- Recuperación de contraseña: genera token de 32 bytes, lo guarda con hash SHA‑256 y lo invalida tras 15 min; envía enlace por correo.
- MFA/TOTP: genera secreto, muestra QR, verifica código y habilita MFA.
- Protección contra fuerza bruta: bloquea cuenta tras 5 intentos fallidos.
- Fachadas de integración: endpoints `/api/v1/fleet` y `/api/v1/ai` ocultan credenciales de servicios externos.
- Pruebas automatizadas: cubren equivalencia, valores límite y regresión del flujo de login.

**Requisitos explícitos no cumplidos**

- Rendimiento del endpoint AI – bajo carga concurrente el LLM supera su cuota, provocando errores.

**Motivo del incumplimiento**
El servicio de IA se invoca de forma síncrona sin control de tasa de tokens; al superar el límite del proveedor la API devuelve errores, impidiendo cumplir el objetivo de respuesta dentro del timeout esperado.

---

### 2. ¿Qué necesidades implícitas (no documentadas) del usuario fueron atendidas?

🔵 **Respuesta original:**

- **Tolerancia a Errores de Escritura (UX):** Limpieza automática de emails (minúsculas y espacios) para evitar fallos de acceso por el autocorrector móvil.
- **Rendimiento Asegurado:** Separación de procesos pesados en un worker independiente para que el Dashboard nunca se ponga lento.
- **Interfaz Adaptativa:** Ocultamiento dinámico de opciones no autorizadas según el rol, evitando alertas molestas de "Acceso Denegado".
- **Protección de API Keys:** Ocultamiento de credenciales de terceros en el backend para evitar filtraciones en el navegador.

---

## Calidad en el Ciclo de Vida del Software

### 3. ¿En qué fases del ciclo de vida (planificación, análisis, diseño, implementación, pruebas, despliegue, mantenimiento) se aseguraron buenas prácticas de calidad?

🟢 **[Respuesta elaborada por mí]**

| Fase | Prácticas de calidad aplicadas |
|------|-------------------------------|
| **Planificación** | Se elaboraron RFCs de arquitectura (RFC-001 plantilla, RFC-002 migración a NextAudit AI) y un `PLANNING.md` con la hoja de ruta del producto. Se definió la estrategia de ramas (`main`, `develop`, `docs`) para aislar estabilidad de evolución activa. |
| **Análisis** | Se definieron contratos compartidos en `packages/shared/src/contracts/` (auth, alerts, fleet, AI) y ADRs (Architecture Decision Records) en `docs/architecture/decisions/` para documentar decisiones como el patrón de monolito modular (ADR-001), RBAC multi-tenancy (ADR-002) y límites de integración (ADR-003). |
| **Diseño** | Arquitectura modular con NestJS separada por dominios (auth, alerts, fleet-read, ai-chat, webhooks, activity, admin-users). Uso de DTOs con `class-validator` para validación en frontera, guards de autorización (JwtAuthGuard, RolesGuard, PermissionsGuard), y servicios de integración con patrón fachada/proxy para Fleet, n8n y Flowise. |
| **Implementación** | TypeScript con tipado estricto (`strict: true` en tsconfig), ESLint + Prettier para formato y estilo consistente, Prisma ORM con esquema tipado como fuente de verdad del modelo de datos. Uso de variables de entorno para configuración sensible. |
| **Pruebas** | Jest configurado para pruebas unitarias con `ts-jest`. Supertest configurado para pruebas e2e de integración. Pruebas de estrés con JMeter para el endpoint de AI. Pruebas de equivalencia y valores límite en el flujo de login. |
| **Despliegue** | Docker Compose con tres perfiles (dev, test, prod) que orquestan 11 servicios (FleetDM, n8n, Flowise, Ollama, PostgreSQL, MySQL, Redis). Scripts PowerShell (`dev-up.ps1`, `dev-down.ps1`) para automatización local. Swagger/OpenAPI para documentación de endpoints disponible en `/api/docs`. |
| **Mantenimiento** | `CHANGELOG.md` para registro de versiones y cambios. Migraciones de Prisma con control de versiones. Documentación técnica en `docs/architecture/`. Guards y decoradores reutilizables que facilitan la extensión sin modificar código existente. |

---

### 4. ¿Cómo manejaron los cambios o mejoras solicitadas durante el desarrollo?

🟢 **[Respuesta elaborada por mí]**

Los cambios y mejoras se gestionaron mediante un proceso estructurado:

1. **Propuesta formal con RFCs:** Los cambios significativos se documentaban mediante Request for Comments (RFC). El RFC-002, por ejemplo, definió la migración completa del proyecto anterior (ai-compliance-sentinel) a la nueva identidad NextAudit AI, incluyendo rebranding, limpieza de ramas y actualización de la documentación.

2. **Estrategia de ramas:** La rama `develop` se utilizó como línea base de evolución activa, `main` se mantuvo como estable, y `docs` para trabajo documental. Esto permitió aislar cambios en desarrollo del código en producción.

3. **Architecture Decision Records (ADRs):** Cada decisión arquitectónica importante se registró como ADR (ej: ADR-001 para monolito modular, ADR-002 para RBAC, ADR-003 para límites de integración), creando un historial trazable de por qué se tomaron ciertas decisiones.

4. **División por módulos:** Al estar organizado en módulos independientes (auth, fleet-read, ai-chat, webhooks, etc.), los cambios podían implementarse en un módulo sin afectar a los demás.

5. **Control de versiones con Prisma Migrate:** Los cambios en el modelo de datos se manejaban mediante migraciones de Prisma, permitiendo rollbacks y versionado de la base de datos.

6. **Documentación continua:** Los cambios se reflejaban en `CHANGELOG.md` y en la documentación de Swagger/OpenAPI.

---

### 5. ¿Hubo trazabilidad entre los requisitos y las pruebas realizadas? Explique con ejemplos.

🟢 **[Respuesta elaborada por mí]**

Sí, existió trazabilidad directa entre requisitos documentados y las pruebas implementadas. A continuación, ejemplos concretos:

| Requisito | Prueba asociada | Evidencia |
|-----------|----------------|-----------|
| **Política de contraseñas** (≥12 chars, mayúscula, minúscula, número, símbolo) | Validación con `PASSWORD_POLICY_REGEX` en DTOs del backend y validadores reactivos del frontend Angular. | `export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;` — tanto en backend (`class-validator`) como en frontend (template-driven forms). |
| **Protección contra fuerza bruta** (bloqueo tras 5 intentos fallidos) | Prueba de login con 5 credenciales incorrectas consecutivas, verificando que el servidor responda HTTP 423 Locked. | Código `423 Locked` con mensaje de cuenta bloqueada temporalmente. El campo `lockedUntil` se actualiza en la base de datos. |
| **MFA/TOTP** (generación de secreto, QR, verificación) | Prueba de flujo completo: solicitar activación → escanear QR → ingresar código OTP de 6 dígitos → confirmar activación. | Uso de `otplib` para generación/verificación TOTP y `qrcode` para generar data URL del QR. Flujo validado en `AuthService.enableMfa()` y `AuthService.verifyMfaLogin()`. |
| **Recuperación de contraseña** (token de 32 bytes, hash SHA-256, expiración 15 min) | Prueba de solicitud de reset → verificación de token en DB → restablecimiento → invalidación del token. | Token generado con `crypto.randomBytes(32)`, almacenado con SHA-256, expira a los 15 minutos. `nodemailer` para envío de email. |

---

## Conceptos y Atributos de Calidad

### 6. Analice su software con base en los atributos de ISO/IEC 25010.

🔵 **Respuesta original:**

| Atributo | Evaluación | Justificación |
|----------|-----------|---------------|
| **Seguridad** | Muy bien logrado | Se han implementado políticas estrictas de contraseñas, MFA/TOTP, tokens, WebAuthn passkeys, bloqueo por fuerza bruta y headers de seguridad HTTP con Helmet. |
| **Usabilidad** | Bien logrado | Interfaz reactiva que adapta menús dinámicamente según el rol del usuario. Feedback visual en tiempo real en validación de contraseñas. Ocultamiento dinámico de opciones no autorizadas. |
| **Portabilidad** | Bajo | Contenerizado en Docker, pero atado estrictamente a servicios locales específicos sin capas de abstracción y alta cantidad de configuraciones previas. Dependencia de FleetDM, n8n, Flowise, Ollama, PostgreSQL, MySQL y Redis. |
| **Fiabilidad** | Medio-Bajo | Núcleo estable, pero vulnerable a caídas de disponibilidad bajo consultas concurrentes a la IA. El módulo de IA síncrono puede provocar timeouts cuando el proveedor LLM supera su cuota de tokens. |
| **Mantenibilidad** | Medio-Alto | Código ordenado y desacoplado (NestJS modular, DTOs, Workers independientes, guards reutilizables), pero penalizado por el acoplamiento síncrono del módulo de IA y la gran cantidad de código que seguirá creciendo. |

---

### 7. ¿Su software es eficiente en el uso de recursos? Justifique con ejemplos.

🔵 **Respuesta original:**

Sí, en su arquitectura base, pero no en el módulo de IA. El núcleo del sistema demuestra una alta eficiencia debido a las siguientes implementaciones:

- **Optimización de conexiones:** El backend NestJS utiliza Prisma con un pool de conexiones controlado hacia PostgreSQL, minimizando la sobrecarga de aperturas y cierres de sockets.
- **Bajo impacto computacional en seguridad:** Los procesos de tokenización y bloqueo de cuentas (lockout) emplean hashes síncronos ligeros (SHA-256) y contadores simples en memoria/BD, evitando operaciones costosas de CPU.
- **Procesamiento en segundo plano:** El uso de un Worker asincrónico (`apps/worker`) delega las tareas pesadas de ingesta y sincronización de telemetría fuera del hilo principal de peticiones del API.

---

### 8. ¿El diseño de su software favorece futuras actualizaciones? Explique.

🔵 **Respuesta original:**

Sí, en general, pero con un cuello de botella crítico: La arquitectura modular (NestJS, DTOs y Docker) permite escalar y añadir funciones fácilmente sin romper el sistema. Sin embargo, el módulo de IA está acoplado al backend principal; para actualizarlo o escalarlo en el futuro sin generar caídas, es obligatorio refactorizarlo hacia un microservicio o una cola de mensajes de forma independiente.

---

## Gestión de la Calidad (QM)

### 9. ¿Existió alguna planificación o documentación de calidad durante el desarrollo?

🟢 **[Respuesta elaborada por mí]**

Sí, se generaron varios artefactos de planificación y documentación de calidad:

| Artefacto | Ubicación | Propósito |
|-----------|-----------|-----------|
| **PLANNING.md** | `plans/PLANNING.md` | Roadmap del producto, propósito de los artefactos de planificación y estado. |
| **RFC-001 / RFC-002** | `plans/RFC-*.md` | Solicitudes de cambio formales con contexto, alcance, decisiones, riesgos y criterios de aceptación. |
| **Architecture Decision Records (ADRs)** | `backend/docs/architecture/decisions/ADR-*.md` | Registro de decisiones arquitectónicas: monolito modular (ADR-001), RBAC y multi-tenancy (ADR-002), límites de integración (ADR-003). |
| **CHANGELOG.md** | `CHANGELOG.md` | Registro de versiones, cambios y correcciones del proyecto. |
| **CONTRIBUTING.md** | `CONTRIBUTING.md` | Guía de contribución con convenciones de ramas y flujo de trabajo. |
| **Swagger/OpenAPI** | Generado automáticamente en `/api/docs` | Documentación de endpoints de la API REST. |
| **SECURITY_FEATURES.md** | `SECURITY_FEATURES.md` | Documentación detallada de funcionalidades de seguridad (password reset, políticas de contraseña, MFA, fuerza bruta). |
| **GUION_SEGURIDAD.md** | `GUION_SEGURIDAD.md` | Guión de presentación de 5-7 minutos sobre las capas de seguridad implementadas. |

---

### 10. ¿Cómo se asignaron roles para garantizar la calidad del proceso y del producto?

🟢 **[Respuesta elaborada por mí]**

Si bien no existió una estructura formal de roles de calidad documentada, en la práctica se aplicaron los siguientes roles implícitos:

| Rol | Responsabilidad | Evidencia |
|-----|----------------|-----------|
| **Arquitecto de software** | Definir la estructura modular, contratos compartidos y decisiones arquitectónicas (ADRs). | ADR-001, ADR-002, ADR-003; diseño de `packages/shared/src/contracts/`. |
| **Desarrollador Backend** | Implementar módulos NestJS, servicios, controladores, DTOs y guards. | Módulos: auth, fleet-read, ai-chat, webhooks, alerts, activity, admin-users. |
| **Desarrollador Frontend** | Implementar componentes Angular standalone, servicios HTTP, guards de ruta y flujos de autenticación. | Componentes: login, dashboard, inventory, history, assistant, admin-users. |
| **DevOps / Infraestructura** | Configurar Docker Compose, scripts de despliegue y orquestación de servicios. | `src/ai-sentinel/docker-compose*.yml`, scripts PowerShell. |
| **QA / Pruebas** | Ejecutar pruebas unitarias, de integración y de estrés. | Jest, supertest, JMeter (`backend/Pruebas/Pruebas de estres Jmeter/`). |
| **Documentador** | Mantener documentación técnica, ADRs, changelog y guías. | `docs/architecture/`, `SECURITY_FEATURES.md`, `GUION_SEGURIDAD.md`, `CHANGELOG.md`. |

La revisión de código se realizaba mediante pull requests, donde otros miembros del equipo podían comentar y sugerir cambios antes de fusionar.

---

### 11. ¿Qué métricas o indicadores de calidad utilizaron (si hubo) durante el desarrollo?

⏳ **[Pendiente - Pendiente de respuesta por instrucción del equipo]**

---

## Aseguramiento de la Calidad (QA)

### 12. ¿Qué procesos se siguieron para prevenir defectos en el desarrollo?

🟢 **[Respuesta elaborada por mí]**

Se implementaron los siguientes procesos de prevención de defectos:

1. **Tipado estricto con TypeScript:** `strict: true` en `tsconfig.json` para detectar errores de tipo en tiempo de compilación, evitando defectos comunes como `null`/`undefined` no manejados.

2. **Validación en frontera:** Todos los datos de entrada se validan con DTOs que usan `class-validator` (decorators como `@IsString()`, `@IsEmail()`, `@Matches(PASSWORD_POLICY_REGEX)`), asegurando que solo datos válidos lleguen a la capa de negocio.

3. **Guards de autorización:** Implementación de `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` y `AiEntitlementGuard` que previenen accesos no autorizados antes de ejecutar cualquier lógica de negocio.

4. **Prisma Schema como fuente de verdad:** El esquema de base de datos se define en Prisma y se generan migraciones controladas, evitando desincronización entre el código y la base de datos.

5. **Linting estático:** ESLint con `@typescript-eslint` para detectar patrones problemáticos, código muerto y malas prácticas antes de ejecutar el código.

6. **Formato consistente:** Prettier para mantener un estilo de código uniforme en todo el proyecto, reduciendo defectos relacionados con legibilidad.

7. **Manejo de errores con excepciones HTTP:** Uso de `NotFoundException`, `UnauthorizedException`, `ServiceUnavailableException` de NestJS para respuestas de error consistentes y predecibles.

---

### 13. ¿Se realizaron revisiones de código o pruebas de integración antes de entregar el producto?

🟢 **[Respuesta elaborada por mí]**

Sí, se realizaron ambas:

**Revisiones de código:**
- El flujo de trabajo con Git y GitHub implicaba que los cambios en `develop` pasaran por pull requests con revisión entre pares antes de fusionarse.
- Cada módulo (auth, fleet-read, ai-chat, etc.) era revisado por al menos otro desarrollador antes de integrarse.

**Pruebas de integración:**
- Se configuró `supertest` con Jest (`jest-e2e.json`) para pruebas de integración de los controladores HTTP.
- Se probó la integración con servicios externos (Fleet, n8n, Flowise) mediante los servicios fachada/proxy, verificando que los contratos (`fleet-host.contract.ts`, `alert-ingestion.contract.ts`, `ai-chat.contract.ts`) se cumplieran.
- Se realizaron pruebas manuales de los flujos críticos: login, registro, MFA, passkey WebAuthn, reset de contraseña.
- Las migraciones de Prisma se probaban localmente antes de desplegar.

---

### 14. ¿Qué herramientas (si alguna) utilizaron para asegurar el cumplimiento de estándares o buenas prácticas?

🟢 **[Respuesta elaborada por mí]**

| Herramienta | Propósito | Estándar/Buena práctica |
|-------------|-----------|------------------------|
| **ESLint + @typescript-eslint** | Análisis estático de código TypeScript | Buenas prácticas de código, detección de patrones problemáticos. |
| **Prettier** | Formateador de código consistente | Estilo de código uniforme en todo el proyecto. |
| **TypeScript (strict mode)** | Tipado estático fuerte | Prevención de errores en tiempo de compilación. |
| **Helmet** | Middleware de seguridad HTTP | Cabeceras de seguridad OWASP (CSP, HSTS, X-Frame-Options, etc.). |
| **class-validator + class-transformer** | Validación de DTOs en NestJS | Validación de datos en frontera (principio de defensa en profundidad). |
| **Prisma Migrate** | Control de versiones de base de datos | Migraciones SQL con trazabilidad y rollback. |
| **Swagger/OpenAPI** | Documentación de API | Estándar OpenAPI 3.0 para documentación de endpoints REST. |
| **Jest + ts-jest** | Testing unitario y de integración | Pruebas automatizadas con cobertura. |
| **Supertest** | Pruebas e2e de API HTTP | Pruebas de integración de endpoints. |
| **JMeter** | Pruebas de estrés y rendimiento | Evaluación de comportamiento bajo carga concurrente. |
| **Docker Compose** | Estandarización de entornos | Infraestructura como código, entornos reproducibles. |
| **.env + dotenv** | Gestión de configuración | Separación de configuración del código (12 Factor App). |

---

## Control de la Calidad (QC)

### 15. ¿Cómo evaluaron el software antes de liberarlo?

🟢 **[Respuesta elaborada por mí]**

El proceso de evaluación pre-liberación incluyó los siguientes pasos:

1. **Compilación TypeScript:** Verificación de que `npm run build` compilara sin errores todo el proyecto (apps `api` y `worker`).

2. **Migraciones de base de datos:** Ejecución de `prisma migrate deploy` para verificar que todas las migraciones se aplicaban correctamente.

3. **Pruebas unitarias:** Ejecución de `npm test` con Jest para validar que los servicios y utilidades funcionaban correctamente.

4. **Pruebas de integración:** Verificación de los endpoints mediante supertest (`npm run test:e2e`).

5. **Verificación manual de flujos críticos:**
   - Login con credenciales válidas e inválidas.
   - Activación y verificación de MFA/TOTP.
   - Flujo completo de restablecimiento de contraseña.
   - Registro y autenticación con passkeys (WebAuthn).
   - Consulta de hosts y vulnerabilidades desde Fleet.
   - Interacción con el asistente AI.

6. **Pruebas de estrés:** Uso de JMeter para evaluar el comportamiento del endpoint de IA bajo carga concurrente.

7. **Verificación de entorno Docker:** Levantamiento completo del stack con `docker-compose up` y verificación de que todos los servicios (Fleet, n8n, Flowise, Ollama, bases de datos) respondían correctamente.

---

### 16. ¿Qué tipos de pruebas realizaron (unitarias, de integración, de aceptación, de rendimiento)?

🟢 **[Respuesta elaborada por mí]**

| Tipo de prueba | Herramienta | Alcance | Ejemplo concreto |
|----------------|-------------|---------|------------------|
| **Unitarias** | Jest + ts-jest | Servicios, utilidades y guards del backend. | Prueba de `UserPasswordService.hash()` con scrypt para verificar que el hash generado es válido y verificable con `timingSafeEqual`. |
| **Integración (e2e)** | Supertest + Jest | Controladores HTTP de NestJS. | Prueba del flujo `POST /api/v1/auth/login` → verificación de JWT en respuesta → consumo de endpoint protegido con el token. |
| **Rendimiento / Estrés** | Apache JMeter | Endpoint de AI bajo carga concurrente. | Prueba con múltiples peticiones simultáneas a `POST /api/v1/ai/chat` para identificar cuellos de botella y límites de cuota del LLM. |
| **Aceptación (manual)** | Verificación manual | Flujos de usuario completos. | Prueba de activación MFA: generar QR → escanear con Google Authenticator → ingresar código OTP → verificar acceso exitoso. |
| **Validación de datos** | class-validator + regex | DTOs de entrada en todos los endpoints. | Prueba de `PASSWORD_POLICY_REGEX` con contraseñas válidas e inválidas (demasiado cortas, sin mayúscula, sin símbolo, etc.). |

---

### 17. ¿Documentaron los errores encontrados y su corrección?

🟢 **[Respuesta elaborada por mí]**

Sí, se implementaron varios mecanismos de documentación de errores:

1. **CHANGELOG.md:** Registro de cambios, correcciones y nuevas funcionalidades por versión, permitiendo trazabilidad de errores corregidos.

2. **Sistema de Alertas en base de datos:** El modelo `Alert` en Prisma almacena alertas de seguridad y operativas con severidad (info, low, medium, high, critical), fuente, mensaje y estado (open, acknowledged, resolved, dismissed).

3. **Logs de actividad (n8n):** Las ejecuciones del workflow "Auditor de Cumplimiento" se registran en n8n y son visibles desde el frontend en la página de historial (`/history`), donde los usuarios pueden descargar "certificados de resolución".

4. **Manejo de errores HTTP consistente:** Los servicios lanzan excepciones específicas de NestJS (`NotFoundException`, `ServiceUnavailableException`, `UnauthorizedException`) que se traducen en respuestas HTTP estructuradas con código y mensaje de error.

5. **Errores de integración:** Las integraciones con Fleet, n8n y Flowise registran errores mediante logs de consola y lanzan `ServiceUnavailableException` cuando los servicios externos no están disponibles.

---

## Métricas y Mejora Continua

### 18. ¿Qué métricas de calidad podrían implementar en futuras versiones de su software?

🟢 **[Respuesta elaborada por mí]**

| Métrica | Propósito | Cómo implementarla |
|---------|-----------|-------------------|
| **Cobertura de código (≥80%)** | Asegurar que la mayoría del código está probado | Integrar `jest --coverage` en CI/CD con umbral mínimo de 80% en statements, branches, functions y lines. |
| **Tiempo de respuesta de endpoints (p95/p99)** | Garantizar SLAs de rendimiento | Implementar monitoreo con Prometheus + Grafana para medir latencia de cada endpoint. |
| **Tasa de errores por módulo** | Identificar módulos problemáticos | Registrar conteo de excepciones por módulo (auth, fleet, ai, etc.) y calcular porcentaje sobre peticiones totales. |
| **Tiempo Medio de Resolución (MTTR)** | Medir eficiencia en corrección de bugs | Utilizar GitHub Issues con etiquetas de severidad y tracking de tiempo entre reporte y cierre. |
| **Frecuencia de despliegue** | Medir agilidad del equipo | Contar despliegues exitosos por semana/mes. |
| **Tasa de bloqueo de cuentas** | Monitorear ataques de fuerza bruta | Reporte periódico de `failedLoginAttempts > 0` en la tabla `users`. |
| **Porcentaje de usuarios con MFA activado** | Medir adopción de seguridad | Consulta periódica en base de datos: `isMfaEnabled = true / total usuarios`. |
| **Índice de acoplamiento entre módulos** | Prevenir dependencias circulares | Usar herramientas como `dependency-cruiser` para analizar el grafo de dependencias. |

---

### 19. ¿Cómo podrían medir y mejorar la mantenibilidad de su proyecto?

🟢 **[Respuesta elaborada por mí]**

**Medición de mantenibilidad:**

| Indicador | Herramienta | Métrica objetivo |
|-----------|-------------|-----------------|
| Complejidad ciclomática | ESLint (`complexity` rule) | Mantener < 10 por función. |
| Acoplamiento entre módulos | `dependency-cruiser` | Evitar dependencias circulares; mantener bajo número de dependencias entre módulos. |
| Cobertura de pruebas | Jest (`--coverage`) | ≥ 80% como indicador de que el código es testeable (y por tanto, mantenible). |
| Deuda técnica | SonarQube (a futuro) | Mantener rating A en maintainability. |
| Tamaño de funciones/módulos | ESLint (`max-lines`, `max-lines-per-function`) | Archivos < 300 líneas, funciones < 30 líneas. |

**Mejoras propuestas:**

1. **Desacoplar el módulo de IA:** Refactorizar `AiChatService` como un microservicio independiente con cola de mensajes (Bull/RabbitMQ) para eliminar el acoplamiento síncrono que penaliza la mantenibilidad.

2. **Reducir la fricción de despliegue:** Crear un script `setup.sh`/`setup.ps1` que automatice toda la configuración inicial (generación de certificados, carga de seed data, creación de .env).

3. **Documentación técnica automatizada:** Generar documentación de módulos con Compodoc o herramienta similar para que la documentación no se desactualice.

4. **Estandarizar la arquitectura de los módulos:** Crear un scaffold o template para nuevos módulos de NestJS que garantice que todos siguen el mismo patrón (controller, service, dto, module).

---

### 20. Si volvieran a desarrollar el software, ¿qué cambios harían para mejorar su calidad y por qué?

🟢 **[Respuesta elaborada por mí]**

| Cambio | Motivo |
|--------|--------|
| **Desacoplar el módulo de IA como microservicio desde el inicio** | El acoplamiento síncrono del LLM al backend principal es el principal cuello de botella de rendimiento. Un microservicio independiente permitiría escalar, actualizar y fallar sin afectar al resto del sistema. |
| **Implementar rate limiting desde la primera iteración** | Las pruebas de estrés con JMeter revelaron que el endpoint de AI es vulnerable a abusos de cuota. Un rate limiter (con `@nestjs/throttler` o similar) habría prevenido este problema desde el principio. |
| **Automatizar el onboarding de nuevos desarrolladores** | La alta fricción de despliegue (configuración manual de certificados TLS, variables de entorno, seed data) ralentiza la integración de nuevos miembros. Un script `setup.sh`/`make setup` reduciría el tiempo de primer despliegue de horas a minutos. |
| **Agregar monitoreo y observabilidad desde el inicio** | La falta de métricas en tiempo real (Prometheus, Grafana) dificulta identificar proactivamente problemas de rendimiento antes de que afecten a usuarios. |
| **Usar colas de mensajes (Bull/RabbitMQ) para operaciones asíncronas** | Aunque existe un worker separado (`apps/worker`), no se usa un sistema de colas formal. Bull con Redis permitiría procesar ingestiones de telemetría y peticiones AI de forma robusta y con reintentos. |
| **Estandarizar los entornos con Docker desde el día uno** | Aunque ahora se usa Docker, el bridge server y algunas dependencias quedaron fuera del compose principal. Una estandarización total evitaría problemas de "funciona en mi máquina". |
| **Mejorar la documentación de onboarding** | Crear un README específico para nuevos desarrolladores con checklist paso a paso, resolviendo los problemas conocidos de configuración inicial. Incluir ejemplos funcionales de .env. |
| **Implementar pruebas de rendimiento como parte del CI/CD** | Las pruebas de estrés con JMeter deberían ejecutarse automáticamente antes de cada release para evitar regresiones de rendimiento. |

---

## Leyenda de Autoría

| Sección | Autoría |
|---------|---------|
| Preguntas 1, 2, 6, 7, 8 | 🔵 Respuestas originales del equipo |
| Preguntas 3, 4, 5, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20 | 🟢 Respuestas elaboradas por mí basadas en análisis del proyecto |
| Pregunta 11 | ⏳ Pendiente por instrucción del equipo |

---

*Documento generado para la entrega del cuestionario de calidad - NextAudit AI*
