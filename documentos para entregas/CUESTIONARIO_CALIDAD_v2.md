# Cuestionario de Calidad - NextAudit AI (v2)

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

**Planificación:** Se elaboraron RFCs de arquitectura (RFC-001, RFC-002) y un `PLANNING.md` con la hoja de ruta. Se definió la estrategia de ramas (`main`, `develop`, `docs`) para aislar estabilidad de evolución activa.

**Análisis:** Se definieron contratos compartidos en `packages/shared/src/contracts/` y ADRs en `docs/architecture/decisions/` para documentar decisiones como el monolito modular (ADR-001), RBAC multi-tenancy (ADR-002) y límites de integración (ADR-003).

**Diseño:** Arquitectura modular con NestJS separada por dominios (auth, alerts, fleet-read, ai-chat, webhooks, activity, admin-users). Uso de DTOs con `class-validator`, guards de autorización, y servicios con patrón fachada/proxy para Fleet, n8n y Flowise.

**Implementación:** TypeScript con tipado estricto, ESLint + Prettier, Prisma ORM con esquema tipado. Uso de variables de entorno para configuración sensible.

**Pruebas:** Jest configurado con `ts-jest`, Supertest para pruebas e2e, JMeter para estrés en el endpoint de AI, y pruebas de equivalencia/valores límite en login.

---

### 4. ¿Cómo manejaron los cambios o mejoras solicitadas durante el desarrollo?

🟢 **[Respuesta elaborada por mí]**

1. **Propuesta formal con RFCs:** Cambios significativos se documentaban como RFC. El RFC-002 definió la migración de ai-compliance-sentinel a NextAudit AI.
2. **Estrategia de ramas:** `develop` para evolución activa, `main` como estable, `docs` para documentación.
3. **Architecture Decision Records (ADRs):** Cada decisión se registró como ADR (ADR-001 monolito modular, ADR-002 RBAC, ADR-003 límites de integración).
4. **División por módulos:** Cada dominio es independiente, los cambios en un módulo no afectan a los demás.
5. **Control de versiones con Prisma Migrate:** Migraciones con rollback y versionado de base de datos.
6. **Documentación continua:** Los cambios se reflejaban en `CHANGELOG.md` y Swagger/OpenAPI.

---

### 5. ¿Hubo trazabilidad entre los requisitos y las pruebas realizadas? Explique con ejemplos.

🟢 **[Respuesta elaborada por mí]**

Sí, cada requisito documentado tuvo una prueba asociada:

**Política de contraseñas:** Se validó con la expresión regular `PASSWORD_POLICY_REGEX` tanto en DTOs del backend (class-validator) como en validadores reactivos del frontend Angular. La regex exige mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.

**Protección contra fuerza bruta:** Se probó enviando 5 credenciales incorrectas consecutivas. El servidor responde HTTP 423 Locked y actualiza el campo `lockedUntil` en la base de datos.

**MFA/TOTP:** Se probó el flujo completo: activación desde el dashboard → generación de QR con `otplib` y `qrcode` → escaneo con autenticador → ingreso de código OTP de 6 dígitos → verificación exitosa en `AuthService.enableMfa()`.

**Recuperación de contraseña:** Se probó la solicitud de reset → generación de token de 32 bytes con `crypto.randomBytes()` → almacenamiento con hash SHA-256 → envío de correo con `nodemailer` → restablecimiento → invalidación del token.

---

## Conceptos y Atributos de Calidad

### 6. Analice su software con base en los atributos de ISO/IEC 25010.

🔵 **Respuesta original:**

**Seguridad (Muy bien logrado):** Se implementaron políticas estrictas de contraseñas, MFA/TOTP, tokens JWT, WebAuthn passkeys, bloqueo por fuerza bruta y headers de seguridad con Helmet.

**Usabilidad (Bien logrado):** Interfaz reactiva que adapta menús según el rol del usuario con feedback visual en tiempo real en la validación de contraseñas y ocultamiento de opciones no autorizadas.

**Portabilidad (Bajo):** El sistema está contenerizado en Docker pero atado a servicios específicos (FleetDM, n8n, Flowise, Ollama, PostgreSQL, MySQL, Redis) y requiere alta configuración previa.

**Fiabilidad (Medio-Bajo):** El núcleo es estable, pero el módulo de IA es vulnerable a caídas de disponibilidad bajo consultas concurrentes cuando el proveedor LLM supera su cuota de tokens.

**Mantenibilidad (Medio-Alto):** Código desacoplado con NestJS modular, DTOs y workers independientes, pero penalizado por el acoplamiento síncrono del módulo de IA.

---

### 7. ¿Su software es eficiente en el uso de recursos? Justifique con ejemplos.

🔵 **Respuesta original:**

Sí, en su arquitectura base, pero no en el módulo de IA. El núcleo demuestra eficiencia por:

- **Optimización de conexiones:** Prisma con pool controlado hacia PostgreSQL minimiza la sobrecarga de apertura/cierre de sockets.
- **Bajo impacto computacional en seguridad:** Los procesos de tokenización y lockout usan hashes SHA-256 ligeros y contadores simples en memoria/BD.
- **Procesamiento en segundo plano:** El Worker (`apps/worker`) delega ingesta y sincronización fuera del hilo principal de la API.

---

### 8. ¿El diseño de su software favorece futuras actualizaciones? Explique.

🔵 **Respuesta original:**

Sí, en general, pero con un cuello de botella crítico. La arquitectura modular (NestJS, DTOs y Docker) permite escalar y añadir funciones sin romper el sistema. Sin embargo, el módulo de IA está acoplado al backend principal; para escalarlo sin generar caídas es necesario refactorizarlo a microservicio o cola de mensajes.

---

## Gestión de la Calidad (QM)

### 9. ¿Existió alguna planificación o documentación de calidad durante el desarrollo?

🟢 **[Respuesta elaborada por mí]**

Sí, se generaron varios artefactos:

- **PLANNING.md** (`plans/PLANNING.md`) — Roadmap del producto y estado actual.
- **RFC-001 y RFC-002** (`plans/RFC-*.md`) — Solicitudes de cambio formales con alcance y criterios de aceptación.
- **Architecture Decision Records** (`backend/docs/architecture/decisions/ADR-*.md`) — Registro de decisiones arquitectónicas (monolito modular, RBAC, límites de integración).
- **CHANGELOG.md** — Versiones, cambios y correcciones del proyecto.
- **CONTRIBUTING.md** — Guía de contribución con convenciones de ramas.
- **Swagger/OpenAPI** en `/api/docs` — Documentación de endpoints REST.
- **SECURITY_FEATURES.md** — Detalle de funcionalidades de seguridad.
- **GUION_SEGURIDAD.md** — Guión de presentación de las capas de seguridad.

---

### 10. ¿Cómo se asignaron roles para garantizar la calidad del proceso y del producto?

🟢 **[Respuesta elaborada por mí]**

Aunque no hubo una estructura formal, los roles se definieron implícitamente:

- **Arquitecto:** Definió la estructura modular y los contratos compartidos, registrando decisiones en ADRs.
- **Desarrollador Backend:** Implementó módulos NestJS (auth, fleet-read, ai-chat, webhooks, alerts, activity, admin-users) con DTOs y guards.
- **Desarrollador Frontend:** Implementó componentes Angular (login, dashboard, inventory, history, assistant, admin-users) con servicios HTTP y guards de ruta.
- **DevOps/Infraestructura:** Configuró Docker Compose y scripts de despliegue.
- **QA/Pruebas:** Ejecutó pruebas unitarias con Jest, de integración con Supertest y de estrés con JMeter.
- **Documentador:** Mantuvo documentación técnica, ADRs, changelog y guías.

La revisión de código se realizaba mediante pull requests donde otros miembros comentaban y sugerían cambios antes de fusionar.

---

### 11. ¿Qué métricas o indicadores de calidad utilizaron (si hubo) durante el desarrollo?

⏳ **[Pendiente - Pendiente de respuesta por instrucción del equipo]**

---

## Aseguramiento de la Calidad (QA)

### 12. ¿Qué procesos se siguieron para prevenir defectos en el desarrollo?

🟢 **[Respuesta elaborada por mí]**

1. **Tipado estricto con TypeScript:** `strict: true` en tsconfig detecta errores de tipo en compilación.
2. **Validación en frontera:** DTOs con class-validator (`@IsString`, `@IsEmail`, `@Matches(PASSWORD_POLICY_REGEX)`) aseguran que solo datos válidos lleguen a la capa de negocio.
3. **Guards de autorización:** JwtAuthGuard, RolesGuard, PermissionsGuard y AiEntitlementGuard previenen accesos no autorizados.
4. **Prisma Schema como fuente de verdad:** Migraciones controladas evitan desincronización código-BD.
5. **Linting estático:** ESLint con @typescript-eslint detecta patrones problemáticos.
6. **Formato consistente:** Prettier mantiene estilo uniforme.
7. **Manejo de errores HTTP:** Excepciones NestJS (NotFoundException, UnauthorizedException, ServiceUnavailableException) dan respuestas consistentes.

---

### 13. ¿Se realizaron revisiones de código o pruebas de integración antes de entregar el producto?

🟢 **[Respuesta elaborada por mí]**

Sí, se realizaron ambas:

**Revisiones de código:** Los cambios en `develop` pasaban por pull requests con revisión entre pares. Cada módulo (auth, fleet-read, ai-chat, etc.) era revisado por al menos otro desarrollador.

**Pruebas de integración:** Supertest con Jest (`jest-e2e.json`) para controladores HTTP. Se verificaron contratos con Fleet, n8n y Flowise mediante servicios fachada. Se hicieron pruebas manuales de flujos críticos (login, MFA, passkey, reset password). Las migraciones de Prisma se probaban localmente.

---

### 14. ¿Qué herramientas (si alguna) utilizaron para asegurar el cumplimiento de estándares o buenas prácticas?

🟢 **[Respuesta elaborada por mí]**

- **ESLint + @typescript-eslint** — Análisis estático y detección de patrones problemáticos.
- **Prettier** — Formato consistente en todo el proyecto.
- **TypeScript strict mode** — Prevención de errores en compilación.
- **Helmet** — Cabeceras de seguridad HTTP (OWASP).
- **class-validator + class-transformer** — Validación de DTOs en NestJS.
- **Prisma Migrate** — Control de versiones de base de datos con trazabilidad.
- **Swagger/OpenAPI** — Documentación de endpoints REST.
- **Jest + ts-jest** — Testing automatizado.
- **Supertest** — Pruebas e2e de API HTTP.
- **JMeter** — Pruebas de estrés y rendimiento.
- **Docker Compose** — Estandarización de entornos.
- **.env + dotenv** — Separación de configuración del código (12 Factor App).

---

## Control de la Calidad (QC)

### 15. ¿Cómo evaluaron el software antes de liberarlo?

🟢 **[Respuesta elaborada por mí]**

1. Compilación TypeScript (`npm run build`) sin errores.
2. Migraciones de base de datos (`prisma migrate deploy`) verificadas.
3. Pruebas unitarias con Jest (`npm test`).
4. Pruebas de integración con Supertest (`npm run test:e2e`).
5. Verificación manual de flujos críticos: login exitoso/fallido, MFA/TOTP completo, reset de contraseña, passkeys WebAuthn, consulta Fleet, chat con IA.
6. Pruebas de estrés con JMeter para el endpoint de IA.
7. Verificación del entorno Docker con todos los servicios respondiendo.

---

### 16. ¿Qué tipos de pruebas realizaron (unitarias, de integración, de aceptación, de rendimiento)?

🟢 **[Respuesta elaborada por mí]**

- **Unitarias (Jest + ts-jest):** Prueba de `UserPasswordService.hash()` con scrypt, verificando hash válido y verificación con `timingSafeEqual`.
- **Integración e2e (Supertest + Jest):** Flujo `POST /api/v1/auth/login` → JWT → consumo de endpoint protegido.
- **Rendimiento/Estrés (JMeter):** Peticiones simultáneas a `POST /api/v1/ai/chat` para identificar cuellos de botella.
- **Aceptación manual:** Activación MFA: generar QR → escanear con autenticador → ingresar OTP → verificar acceso.
- **Validación de datos (class-validator + regex):** Prueba de `PASSWORD_POLICY_REGEX` con contraseñas válidas e inválidas.

---

### 17. ¿Documentaron los errores encontrados y su corrección?

🟢 **[Respuesta elaborada por mí]**

Sí, mediante varios mecanismos:

- **CHANGELOG.md** con registro de cambios y correcciones por versión.
- **Modelo Alert en Prisma** que almacena alertas con severidad, fuente, mensaje y estado.
- **Logs de actividad (n8n)** visibles en el frontend (`/history`) con certificados de resolución descargables.
- **Excepciones HTTP de NestJS** (NotFoundException, ServiceUnavailableException, UnauthorizedException) con respuestas estructuradas.
- **Logs de integración** que registran errores de Fleet, n8n y Flowise cuando no están disponibles.

---

## Métricas y Mejora Continua

### 18. ¿Qué métricas de calidad podrían implementar en futuras versiones de su software?

🟢 **[Respuesta elaborada por mí]**

- **Cobertura de código (≥80%):** Integrar `jest --coverage` en CI/CD para asegurar que el código está probado.
- **Tiempo de respuesta p95/p99:** Monitoreo con Prometheus + Grafana para garantizar SLAs.
- **Tasa de errores por módulo:** Conteo de excepciones por módulo (auth, fleet, AI, etc.) para identificar problemáticos.
- **MTTR (Tiempo Medio de Resolución):** GitHub Issues con etiquetas de severidad y tracking de tiempo.
- **Frecuencia de despliegue:** Conteo de despliegues exitosos por semana.
- **Tasa de bloqueo de cuentas:** Reporte de `failedLoginAttempts > 0` para monitorear ataques de fuerza bruta.
- **Porcentaje de usuarios con MFA:** Consulta de `isMfaEnabled = true / total usuarios` para medir adopción de seguridad.
- **Índice de acoplamiento:** dependency-cruiser para prevenir dependencias circulares.

---

### 19. ¿Cómo podrían medir y mejorar la mantenibilidad de su proyecto?

🟢 **[Respuesta elaborada por mí]**

**Medición:** Complejidad ciclomática con ESLint (< 10 por función), acoplamiento con dependency-cruiser, cobertura de pruebas con Jest (≥80%), deuda técnica con SonarQube (rating A), y tamaño de archivos/funciones con ESLint (< 300 líneas por archivo, < 30 por función).

**Mejoras propuestas:**
1. Desacoplar el módulo de IA como microservicio independiente con cola de mensajes (Bull/RabbitMQ).
2. Crear script `setup.sh`/`setup.ps1` que automatice la configuración inicial (certificados, seed data, .env).
3. Documentación técnica automatizada con Compodoc.
4. Template o scaffold para nuevos módulos NestJS que estandarice el patrón (controller, service, dto, module).

---

### 20. Si volvieran a desarrollar el software, ¿qué cambios harían para mejorar su calidad y por qué?

🟢 **[Respuesta elaborada por mí]**

- **Desacoplar IA como microservicio desde el inicio:** El acoplamiento síncrono del LLM es el principal cuello de botella. Un microservicio permitiría escalar y fallar sin afectar al resto.
- **Rate limiting desde la primera iteración:** Las pruebas de estrés con JMeter mostraron vulnerabilidad a abusos de cuota. Un rate limiter (`@nestjs/throttler`) lo habría prevenido.
- **Automatizar onboarding:** La configuración manual de TLS, .env y seed data ralentiza la integración de nuevos desarrolladores. Un `make setup` reduciría el tiempo de horas a minutos.
- **Monitoreo desde el inicio:** Prometheus + Grafana desde el día uno para detectar problemas de rendimiento proactivamente.
- **Colas de mensajes (Bull/RabbitMQ):** El worker actual no tiene colas formales. Bull con Redis permitiría ingestiones robustas con reintentos.
- **Docker estandarizado desde el día uno:** El bridge server quedó fuera del compose principal, causando problemas de entorno.
- **Documentación de onboarding:** README con checklist paso a paso y .env de ejemplo funcional.
- **Pruebas de rendimiento en CI/CD:** JMeter integrado al pipeline para evitar regresiones.

---

## Leyenda de Autoría

- Preguntas 1, 2, 6, 7, 8 → 🔵 **Respuestas originales del equipo**
- Preguntas 3, 4, 5, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20 → 🟢 **Respuestas elaboradas por mí**
- Pregunta 11 → ⏳ **Pendiente por instrucción del equipo**

---

*Documento generado para la entrega del cuestionario de calidad - NextAudit AI (v2)*
