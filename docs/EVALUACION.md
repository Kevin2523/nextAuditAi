# Documento de evaluación — AI-Compliance Real-Time Sentinel

Cronograma de entregables, criterios de evaluación final y métricas medibles por semana para el proyecto (4 semanas).

---

## Índice

- [Cronograma y entregables (4 semanas)](#cronograma-y-entregables-4-semanas)
- [Criterios de evaluación final](#criterios-de-evaluación-final)
- [Tabla de métricas medibles por semana](#tabla-de-métricas-medibles-por-semana)
- [Cálculo de la nota final](#cálculo-de-la-nota-final)

---

## Cronograma y entregables (4 semanas)

| Semana | Hito principal | Entregables clave |
| ------ | ----------------- | ----------------- |
| **Semana 1** | Diseño y despliegue | **Día 2 (crítico):** Arquitectura técnica (DB, Proxy, Flujo). **Día 5:** Provisión remota vía Ansible e instalación de Osquery. |
| **Semana 2** | Auditoría I | n8n procesando eventos contra `POLICIES.md`. Sistema de alertas por Email funcional. Inferencia en Groq/Ollama. |
| **Semana 3** | ChatOps y Docs | Interfaz de chat funcional (Pull). Flujo de IA-Docs para actualización automática de manuales y README. |
| **Semana 4** | Venta y Demo | Optimización de latencia y remediación. Pitch de venta ejecutivo y Chaos Test (Demo en vivo). |

---

## Criterios de evaluación final

| Criterio | Peso | Descripción |
| -------- | ---- | ----------- |
| **Ingeniería** | **40%** | Despliegue 100% automatizado con Ansible/Docker y robustez del Pipeline CI/CD (Dev → QA → Main). |
| **IA & ChatOps** | **20%** | Precisión de las consultas multi-SO, velocidad de respuesta (Groq) y ausencia de alucinaciones. |
| **Metodología** | **20%** | Trazabilidad en Git, calidad de código (Linters/Tests) y efectividad de la Auto-Documentación. |
| **Venta & Demo** | **20%** | Calidad del pitch ejecutivo, visión de negocio y éxito en la remediación ante el "Chaos Test". |

**Nota final:** suma ponderada de las cuatro categorías (escala 0–10 o 0–100, según convenga).

---

## Tabla de métricas medibles por semana

Cada fila es una **métrica evaluable** en la semana indicada. La **valoración** es sobre 10; el **peso** es el % que aporta a la **nota final** del proyecto. La suma de pesos por criterio coincide con los porcentajes globales (40%, 20%, 20%, 20%).

### Semana 1 — Diseño y despliegue

| Criterio | Métrica medible | Evidencia / cómo medir | Peso | Valoración (0-10) |
| -------- | ---------------- | ----------------------- | ---- | ------------------ |
| Ingeniería | Entrega a tiempo de la **arquitectura técnica** (Día 2): DB, Proxy, flujo de datos documentado. | Documento/ADR + diagrama en repo. | 8% | |
| Ingeniería | **Provisión remota** vía Ansible operativa (Día 5): SSH Linux/Mac, WinRM/SSH Windows. | Playbook ejecutado sin pasos manuales. | 6% | |
| Ingeniería | **Instalación de Osquery** desplegada en al menos un nodo por SO (Win/Mac/Linux). | Osquery respondiendo en nodos de prueba. | 4% | |
| Ingeniería | **Pipeline CI/CD** activo: Linters (Black/Flake8/ESLint) en cada PR. | Workflow en GitHub Actions en verde en PR de ejemplo. | 6% | |
| Ingeniería | Entornos **Docker** definidos: `docker-compose.dev.yml` y `docker-compose.prod.yml`. | Archivos en repo y `docker compose up` funcional. | 4% | |
| Metodología | **Trazabilidad en Git:** commits en ramas correctas, mensajes claros, PRs con descripción. | Revisión de historial y PRs de la semana. | 4% | |
| Metodología | **Calidad de código:** sin secretos en repo, uso de variables de entorno o Vault. | Revisión de código y configuración. | 6% | |
| **Subtotal Semana 1** | | | **38%** | |

### Semana 2 — Auditoría I

| Criterio | Métrica medible | Evidencia / cómo medir | Peso | Valoración (0-10) |
| -------- | ---------------- | ----------------------- | ---- | ------------------ |
| IA & ChatOps | **n8n** procesando eventos y contrastando con `POLICIES.md`. | Flujo publicado + ejemplo de evento que dispare evaluación. | 5% | |
| IA & ChatOps | **Sistema de alertas por Email** funcional ante violación de política. | Correo recibido en prueba controlada. | 4% | |
| IA & ChatOps | **Inferencia** Groq/Ollama operativa: latencia medida y criterio de uso documentado. | Pruebas de latencia + doc soberanía. | 3% | |
| Ingeniería | **CD** para actualizar contenedores (n8n, agente colector) sin pasos manuales. | Pipeline o playbook que actualice y levante servicios. | 4% | |
| Ingeniería | **Secretos** (API Groq, SMTP) gestionados por variables de entorno o Ansible Vault. | No hay claves en código ni en repo. | 2% | |
| Metodología | **Tests unitarios** que validen formato JSON enviado a n8n (u otro contrato acordado). | Tests en CI en verde. | 2% | |
| **Subtotal Semana 2** | | | **20%** | |

### Semana 3 — ChatOps y Docs

| Criterio | Métrica medible | Evidencia / cómo medir | Peso | Valoración (0-10) |
| -------- | ---------------- | ----------------------- | ---- | ------------------ |
| IA & ChatOps | **Interfaz de chat (Pull)** funcional: pregunta en lenguaje natural → respuesta basada en flota. | Demo: pregunta tipo "¿Cuántas laptops tienen disco cifrado?" con respuesta correcta. | 5% | |
| IA & ChatOps | **Text-to-SQL** y/o **Tool Calling**: la IA decide cuándo consultar Osquery y genera query válida. | Ejemplo multi-SO (Windows/Mac/Linux) sin alucinaciones graves. | 3% | |
| Metodología | **Flujo IA-Docs**: actualización automática de README y/o manual técnico desde código/descripciones. | Cambio en código/comentario reflejado en docs generados. | 6% | |
| Metodología | **Calidad de documentación**: README y TECHNICAL_DOCS útiles y actualizados. | Revisión por pares o rúbrica simple. | 2% | |
| **Subtotal Semana 3** | | | **16%** | |

### Semana 4 — Venta y Demo

| Criterio | Métrica medible | Evidencia / cómo medir | Peso | Valoración (0-10) |
| -------- | ---------------- | ----------------------- | ---- | ------------------ |
| Venta & Demo | **Pitch de venta ejecutivo**: claridad, visión de negocio, propuesta de valor. | Presentación en vivo o grabada + rúbrica. | 10% | |
| Venta & Demo | **Chaos Test**: sabotaje controlado; el sistema detecta y la remediación (manual o automatizada) tiene éxito. | Demo en vivo: detección + recuperación demostrada. | 10% | |
| Ingeniería | **Optimización de latencia** y/o alta disponibilidad para la demo. | Comparativa antes/después o checklist de HA. | 4% | |
| Ingeniería | **Playbooks de remediación** (Ansible u otro) documentados y ejecutables. | Al menos un playbook probado en Chaos Test o simulado. | 2% | |
| **Subtotal Semana 4** | | | **26%** | |

---

## Resumen de pesos por criterio

| Criterio | Peso global | Suma pesos en tabla | Desglose |
| -------- | ----------- | -------------------- | -------- |
| Ingeniería | 40% | 40% | S1: 8+6+4+6+4. S2: 4+2. S4: 4+2. |
| IA & ChatOps | 20% | 20% | S2: 5+4+3. S3: 5+3. |
| Metodología | 20% | 20% | S1: 4+6. S2: 2. S3: 6+2. |
| Venta & Demo | 20% | 20% | S4: 10+10. |

**Subtotales por semana:** S1 = 38%, S2 = 20%, S3 = 16%, S4 = 26%. **Total = 100%.**

---

## Cálculo de la nota final

1. **Por métrica:** asigna una valoración de 0 a 10 según evidencia y rúbrica acordada.
2. **Puntuación ponderada por métrica:** `(Valoración / 10) × Peso`.
3. **Nota final:** suma de todas las puntuaciones ponderadas. Resultado en escala 0–10 (o multiplicar por 10 para 0–100).

**Ejemplo:** Si "Arquitectura técnica Día 2" tiene peso 8% y valoración 8/10 → aporta `0,8 × 8 = 6,4` puntos sobre 100, o `0,64` sobre 10.

---

*AI-Compliance Real-Time Sentinel — v16.0 — Documento de evaluación*
