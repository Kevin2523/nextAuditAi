# Changelog

Todos los cambios notables del proyecto **AI-Compliance Real-Time Sentinel** se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/) cuando aplique.

---

## [16.0.0] - 2026-02-02

### Añadido

- **Licencia:** CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International). Archivo `LICENSE` y sección Licencia en README.
- **Disclaimer:** Sección en README indicando origen universitario (UTP, Coclé, Práctica Laboral en Desarrollo de Software), colaboración Cerebro Digital e Infraforge, y recomendación de no uso en producción.
- **Planificación y diseño:**
  - Carpeta `plans/` para planificación general, diseño, RFCs y soporte a issues.
  - `plans/PLANNING.md`: documento principal con propósito de la carpeta y tabla de RFCs.
  - `plans/RFC-001-plantilla.md`: plantilla para nuevas solicitudes de cambio.
  - `plans/RFC-002-init.md`: RFC inicial con hoja de ruta crítica (4 semanas), milestones (M1–M4), mapeo de issues por rol/semana, dependencias entre roles y criterios de evaluación.
- **README:** Sección "Planificación y diseño" con enlace a `plans/` y `PLANNING.md`; actualización de la estructura del repositorio.
- **CI:** Workflow de GitHub Actions (`.github/workflows/ci.yml`) para ramas `main`, `develop` y `testing` (job placeholder).
- **Documentación:** `CONTRIBUTING.md` (roles, flujo de trabajo, reglas de oro), `docs/EVALUACION.md` (cronograma 4 semanas, métricas, criterios de evaluación), `docs/GUIA_ONBOARDING_DESARROLLADOR.md` (onboarding).
- **CHANGELOG:** Este archivo.

### Sin cambios

- Especificación del proyecto v16.0 (visión, Osquery, Groq/Ollama, ChatOps, reglas de oro).
- Flujo de ramas: `develop` → `testing` → `main`.

---

[16.0.0]: https://github.com/maurorosero/nextaudit-ai/releases/tag/v16.0.0
