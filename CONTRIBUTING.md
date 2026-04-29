# Guía de contribución — AI-Compliance Real-Time Sentinel

Gracias por contribuir al proyecto. Esta guía describe los **roles**, las **responsabilidades** por semana y los **criterios de colaboración** para que el equipo avance de forma coordinada.

---

## Índice

- [Flujo de trabajo (ramas y PRs)](#flujo-de-trabajo-ramas-y-prs)
- [Reglas de oro](#reglas-de-oro)
- [Roles y responsabilidades](#roles-y-responsabilidades)
  - [1. Lead of Infrastructure & CI/CD](#1-lead-of-infrastructure--cicd)
  - [2. Lead of Data & Sensors](#2-lead-of-data--sensors)
  - [3. Lead of AI & ChatOps](#3-lead-of-ai--chatops)
  - [4. Lead of Security & AI-Docs](#4-lead-of-security--ai-docs)
- [Criterios de colaboración (interdependencia)](#criterios-de-colaboración-interdependencia)
- [Checklist antes de abrir un PR](#checklist-antes-de-abrir-un-pr)

---

## Flujo de trabajo (ramas y PRs)

| Rama       | Uso                    | Protección      |
| ---------- | ---------------------- | --------------- |
| `develop`  | Integración de desarrollo | Sin protección  |
| `testing`  | Staging / preproducción | PR + CI obligatorio |
| `main`     | Producción             | PR + CI obligatorio |

- Crea ramas desde `develop` con prefijos: `feature/`, `fix/`, `docs/`, `infra/`.
- Los cambios a `testing` y `main` **solo** vía pull request; el pipeline de CI debe pasar (incl. linters y tests).
- Mantén commits atómicos y mensajes claros (p. ej. `feat: agregar query Osquery para parches Windows`).

---

## Reglas de oro

- **Zero Manual Touch:** Todo despliegue e instalación debe estar automatizado (Ansible/Docker). No instalaciones manuales en servidores o estaciones.
- **No Secrets in Code:** Claves API (Groq, SMTP, etc.) solo en variables de entorno o Ansible Vault. Nunca en el código ni en el repositorio.
- **Docker Everywhere:** Servicios (n8n, agente colector, DB) deben ejecutarse en contenedores en Dev, Test y Prod.

---

## Roles y responsabilidades

### 1. Lead of Infrastructure & CI/CD

**Misión:** Garantizar que el código fluya de forma segura desde el desarrollo hasta la producción y que la infraestructura sea replicable y robusta.

| Semana | Tareas |
| ------ | ------ |
| **Semana 1** | Configurar el repositorio en GitHub con reglas de protección de ramas.<br>Crear los entornos `docker-compose.dev.yml` y `docker-compose.prod.yml`.<br>Configurar GitHub Actions para ejecutar Linters (Black/Flake8/ESLint) en cada Pull Request.<br>Desarrollar el Playbook de Ansible para la instalación remota de Osquery (SSH para Linux/Mac, WinRM para Windows). |
| **Semanas 2-3** | Implementar el despliegue continuo (CD) para actualizar los contenedores de n8n y el agente colector.<br>Gestionar el almacenamiento de secretos (API Keys de Groq/SMTP) mediante variables de entorno o Ansible Vault. |
| **Semana 4** | Asegurar la alta disponibilidad del sistema para la Demo y optimizar los tiempos de despliegue. |

---

### 2. Lead of Data & Sensors

**Misión:** Convertir el estado del sistema operativo en datos estructurados y útiles, asegurando que la visibilidad de la flota sea total.

| Semana | Tareas |
| ------ | ------ |
| **Semana 1** | Definir el archivo de configuración `osquery.conf` con los intervalos de consulta (schedule) para eventos críticos.<br>Desarrollar el **Agente Colector** (Python/TS) que actúe como puente entre los nodos y los Webhooks de n8n. |
| **Semanas 2-3** | Crear una librería de queries SQL compatibles con múltiples SO (ej. mapear cómo consultar la RAM en Windows vs Linux).<br>Implementar pruebas unitarias para validar que el JSON enviado a n8n tenga el formato correcto. |
| **Semana 4** | Optimizar las queries para reducir el consumo de CPU en los nodos durante la auditoría en tiempo real. |

---

### 3. Lead of AI & ChatOps

**Misión:** Dotar al sistema de "cerebro" y capacidad de comunicación, permitiendo que la complejidad técnica sea accesible mediante lenguaje natural.

| Semana | Tareas |
| ------ | ------ |
| **Semana 1** | Establecer la conexión n8n ↔ Groq (API) y n8n ↔ Ollama (Local).<br>Realizar pruebas de latencia entre los modelos para decidir qué tareas van a cada motor. |
| **Semanas 2-3** | Diseñar el **System Prompt** de cumplimiento (Compliance Engine) que analiza los datos vs `POLICIES.md`.<br>Desarrollar la lógica de **Text-to-SQL**: transformar la pregunta del usuario en una query de Osquery ejecutable.<br>Implementar el flujo de **Tool Calling** en n8n para que la IA decida cuándo necesita consultar a la flota. |
| **Semana 4** | Refinar la "personalidad" del bot y manejar casos de error (cuando la IA no entiende la pregunta o la query falla). |

---

### 4. Lead of Security & AI-Docs

**Misión:** Definir las reglas del juego (compliance) y asegurar que el conocimiento del proyecto sea auto-generado y profesional.

| Semana | Tareas |
| ------ | ------ |
| **Semana 1** | Redactar las primeras 5-10 reglas en `POLICIES.md` con criterios de aceptación claros.<br>Crear la estructura del documento de arquitectura (ADR) que se entrega el Día 2. |
| **Semanas 2-3** | Configurar el sistema de alertas por Email (formato del informe, niveles de criticidad).<br>Desarrollar el flujo de **AI-Docs**: proceso que tome los comentarios del código y las descripciones de las tareas para actualizar automáticamente `README.md` y `TECHNICAL_DOCS.md`. |
| **Semana 4** | Liderar el diseño del **Pitch de Venta**.<br>Coordinar el **Chaos Test** (sabotaje controlado) para demostrar la eficacia del sistema en la presentación. |

---

## Criterios de colaboración (interdependencia)

Para que el proyecto avance, el equipo debe tener en cuenta:

| Dependencia | Descripción |
| ----------- | ----------- |
| **Infra ↔ Data** | El Lead de Infraestructura no puede desplegar si el Lead de Datos no ha validado el agente colector (formato, conectividad con n8n). |
| **IA ↔ Security** | La IA no puede razonar correctamente si el Lead de Security no ha definido bien las políticas en `POLICIES.md` (reglas claras, criterios de aceptación). |
| **ChatOps ↔ Data** | El ChatOps (Text-to-SQL) fallará si el Lead de Datos no provee un **diccionario de tablas de Osquery** claro (por SO) para que la IA genere queries válidas. |

**Recomendación:** Sincronizarse en cortos (p. ej. inicio de semana) para alinear entregables entre roles y desbloquear dependencias.

---

## Checklist antes de abrir un PR

- [ ] La rama se creó desde `develop` (o la rama base acordada).
- [ ] El código cumple las [reglas de oro](#reglas-de-oro) (sin secretos, despliegue automatizado, Docker donde aplique).
- [ ] Los linters configurados en CI pasan localmente (Black, Flake8, ESLint según el stack).
- [ ] No hay credenciales ni datos sensibles en el diff.
- [ ] La descripción del PR indica el rol/área afectada y, si aplica, el issue o milestone relacionado.
- [ ] Si el cambio afecta a otro rol (p. ej. nuevo formato de JSON para n8n), se ha coordinado con el responsable.

---

*AI-Compliance Real-Time Sentinel — v16.0*
