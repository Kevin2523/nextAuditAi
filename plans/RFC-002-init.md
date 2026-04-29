# RFC-002 — Inicialización del proyecto: hoja de ruta, milestones e issues

| Campo | Valor |
|-------|--------|
| **ID** | RFC-002 |
| **Título** | Inicialización del proyecto: hoja de ruta crítica, milestones e issues |
| **Estado** | Aprobado (documento de referencia) |
| **Fecha** | 2026-02-02 |
| **Autor** | Equipo AI-Compliance Sentinel |

---

## Resumen

RFC inicial del proyecto que documenta la **hoja de ruta crítica** de 4 semanas, los **milestones** de GitHub, el **mapeo con los issues** por rol y semana, y los criterios de éxito. Sirve como punto de partida único para planificación, diseño y trazabilidad entre documentación, issues y evaluación.

---

## Motivación

- **Alinear al equipo:** un solo documento que concentre hitos críticos, fechas y responsabilidades por rol.
- **Trazabilidad:** enlazar README, EVALUACION.md, CONTRIBUTING.md con los issues y milestones reales del repositorio.
- **Soporte a la planificación:** que los issues y la evaluación tengan un ancla explícita en `plans/` para facilitar el seguimiento y la priorización.
- **Referencia para la IA y la documentación:** criterios de cumplimiento y flujo de datos documentados para uso por herramientas y por el sistema de IA-Docs.

---

## Propuesta

### 1. Visión y alcance (referencia)

El **AI-Compliance Real-Time Sentinel** es una plataforma de AIOps y Seguridad de Endpoints que:

- Usa **Osquery** para observabilidad multiplataforma (Win/Mac/Linux).
- Contrasta eventos con **POLICIES.md** mediante **Groq** y **Ollama** (n8n).
- Ofrece **ChatOps** (Text-to-SQL) para consultar la flota en lenguaje natural.

Reglas de oro: **Zero Manual Touch**, **No Secrets in Code**, **Docker Everywhere**. Detalle en [README](../README.md) y [CONTRIBUTING.md](../CONTRIBUTING.md).

### 2. Hoja de ruta crítica (4 semanas)

| Semana | Hito principal | Entregables críticos |
|--------|----------------|----------------------|
| **Semana 1** | Diseño y despliegue | **Día 2 (crítico):** Arquitectura técnica (DB, Proxy, flujo). **Día 5:** Provisión remota Ansible + instalación Osquery. Pipeline CI/CD activo. Docker Dev/Prod. |
| **Semana 2** | Auditoría I | n8n procesando eventos vs POLICIES.md. Alertas por Email. Inferencia Groq/Ollama operativa. Esquema de eventos/telemetría para n8n. |
| **Semana 3** | ChatOps y Docs | Interfaz de chat (Pull) funcional. Text-to-SQL / Tool Calling. Flujo IA-Docs (README y manual técnico desde código). |
| **Semana 4** | Venta y Demo | Pitch de venta ejecutivo. Chaos Test (detección + remediación). Optimización de latencia. Playbooks de remediación. |

Fuente: [docs/EVALUACION.md](../docs/EVALUACION.md).

### 3. Milestones del repositorio

| Milestone | Título | Descripción | Fecha límite | Issues abiertos |
|-----------|--------|-------------|--------------|------------------|
| [M1](https://github.com/maurorosero/nextaudit-ai/milestone/1) | Semana 1: Diseño y CI/CD | Día 2 (arquitectura), Día 5 (Ansible + Osquery), pipeline CI/CD | 2026-02-06 | 6 |
| [M2](https://github.com/maurorosero/nextaudit-ai/milestone/2) | Semana 2: Inteligencia y Auditoría | n8n + POLICIES.md, alertas email, soberanía Ollama/Groq | 2026-02-15 | 4 |
| [M3](https://github.com/maurorosero/nextaudit-ai/milestone/3) | Semana 3: ChatOps y Auto-Documentación | Text-to-SQL, IA-Docs (manual y README) | 2026-02-22 | 2 |
| [M4](https://github.com/maurorosero/nextaudit-ai/milestone/4) | Semana 4: Afinamiento y Pitch | Latencia, playbooks remediación, Chaos Test, pitch venta | 2026-03-01 | 3 |

### 4. Issues por milestone y rol

Cada issue está asociado a un rol (Infra, Data & Sensors, AI & ChatOps, Security & AI-Docs) y a una semana. Enlaces directos al repositorio:

#### Semana 1 (Milestone 1)

| # | Título | Rol | Enlace |
|---|--------|-----|--------|
| 1 | [Infra] Arquitectura técnica: diagrama, DB de logs, Proxy — CRÍTICO | infra-cicd | [#1](https://github.com/maurorosero/nextaudit-ai/issues/1) |
| 2 | [Infra] Pipeline CI/CD en GitHub Actions (Linting / Unit Tests) | infra-cicd | [#2](https://github.com/maurorosero/nextaudit-ai/issues/2) |
| 3 | [Infra] Provisión remota Ansible multi-SO + instalación Osquery | infra-cicd | [#3](https://github.com/maurorosero/nextaudit-ai/issues/3) |
| 4 | [Infra] Arquitectura Docker (Dev / Test / Prod) | infra-cicd | [#4](https://github.com/maurorosero/nextaudit-ai/issues/4) |
| 5 | [Data & Sensors] Queries Osquery y telemetría por SO | data-sensors | [#5](https://github.com/maurorosero/nextaudit-ai/issues/5) |
| 6 | [Security & AI-Docs] POLICIES.md en raíz (contrato de verdad) | security-aidocs | [#6](https://github.com/maurorosero/nextaudit-ai/issues/6) |

#### Semana 2 (Milestone 2)

| # | Título | Rol | Enlace |
|---|--------|-----|--------|
| 7 | [Data & Sensors] Esquema de eventos y telemetría para n8n | data-sensors | [#7](https://github.com/maurorosero/nextaudit-ai/issues/7) |
| 8 | [AI & ChatOps] Motor n8n: eventos vs POLICIES.md (Groq/Ollama) | ai-chatops | [#8](https://github.com/maurorosero/nextaudit-ai/issues/8) |
| 9 | [AI & ChatOps] Análisis de soberanía: Ollama vs Groq según sensibilidad | ai-chatops | [#9](https://github.com/maurorosero/nextaudit-ai/issues/9) |
| 10 | [AI & ChatOps] Sistema de alertas por email (Push) | ai-chatops | [#10](https://github.com/maurorosero/nextaudit-ai/issues/10) |

#### Semana 3 (Milestone 3)

| # | Título | Rol | Enlace |
|---|--------|-----|--------|
| 11 | [AI & ChatOps] Interfaz de chat Text-to-SQL (consultas inventario Pull) | ai-chatops | [#11](https://github.com/maurorosero/nextaudit-ai/issues/11) |
| 12 | [Security & AI-Docs] Flujo IA-Docs: manual técnico y README desde código | security-aidocs | [#12](https://github.com/maurorosero/nextaudit-ai/issues/12) |

#### Semana 4 (Milestone 4)

| # | Título | Rol | Enlace |
|---|--------|-----|--------|
| 13 | [AI & ChatOps] Optimización de latencia del agente | ai-chatops | [#13](https://github.com/maurorosero/nextaudit-ai/issues/13) |
| 14 | [Security & AI-Docs] Playbooks de remediación y eliminación de falsos positivos | security-aidocs | [#14](https://github.com/maurorosero/nextaudit-ai/issues/14) |
| 15 | [Security & AI-Docs] Pitch de venta ejecutivo y Chaos Test | security-aidocs | [#15](https://github.com/maurorosero/nextaudit-ai/issues/15) |

### 5. Dependencias críticas entre roles

| Dependencia | Descripción |
|-------------|-------------|
| **Infra ↔ Data** | Infra no puede cerrar despliegue sin que Data valide el agente colector (formato, conectividad n8n). |
| **IA ↔ Security** | La IA no puede razonar bien sin políticas claras en POLICIES.md (issue #6). |
| **ChatOps ↔ Data** | Text-to-SQL requiere diccionario de tablas Osquery por SO (issue #5, #7). |

Fuente: [CONTRIBUTING.md](../CONTRIBUTING.md).

### 6. Criterios de evaluación final (referencia)

| Criterio | Peso | Descripción breve |
|----------|------|-------------------|
| Ingeniería | 40% | Automatización Ansible/Docker, robustez CI/CD (Dev → QA → Main). |
| IA & ChatOps | 20% | Precisión multi-SO, latencia Groq, ausencia de alucinaciones. |
| Metodología | 20% | Trazabilidad Git, linters/tests, auto-documentación. |
| Venta & Demo | 20% | Pitch ejecutivo, Chaos Test (detección + remediación). |

Detalle de métricas por semana: [docs/EVALUACION.md](../docs/EVALUACION.md).

---

## Alternativas consideradas

- **Mantener solo issues/milestones en GitHub:** se descartó porque la documentación en repo (EVALUACION, CONTRIBUTING) no enlazaba de forma explícita a los números de issue ni a la hoja de ruta crítica en un solo lugar.
- **No tener RFC inicial:** se optó por este RFC para que `plans/` tenga un documento de referencia que amarre visión, hitos, issues y evaluación desde el inicio.

---

## Impacto

- **Componentes afectados:** Planificación (`plans/`), README (referencia a plans/), documentación de evaluación y contribución (referenciada desde este RFC).
- **Riesgos o dependencias:** Ninguno técnico; el documento es de referencia. Las fechas de milestones pueden ajustarse si el cronograma del curso cambia.
- **Issues relacionados:** Todos los issues 1–15 del repositorio, listados en las tablas de la sección 4. Listado completo: [Issues abiertos](https://github.com/maurorosero/nextaudit-ai/issues).

---

## Aprobación / Próximos pasos

- **Criterio de aceptación:** Este RFC queda como documento de referencia inicial; no requiere merge a código.
- **Próximos pasos:**  
  1. Usar este documento como ancla para planificación en cortos (inicio de semana).  
  2. Actualizar la tabla de issues en este RFC si se añaden o reasignan issues a milestones.  
  3. Vincular PRs y otros RFCs a los issues correspondientes cuando sea relevante.
