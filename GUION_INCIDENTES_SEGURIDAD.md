# 🛡️ Guion de Presentación: Dashboard de Incidentes de Ciberseguridad
**500 Incidentes | 10 Países | 50 Empresas | 2022 – 2026**

---

## Página 1: Resumen Ejecutivo

### Datos Clave
- **500 incidentes** registrados en el periodo total.
- **90% (450) respondidos y cerrados.** Solo un **10% (50)** permanece sin resolución.
- Tiempo promedio de resolución: **60.80 horas** (~2.5 días por incidente).
- Distribución de riesgo: **54% Alto (270)**, 29.2% Medio (146), **16.8% Crítico (84)**.
- Indicador global de riesgo: **39.40%** — por debajo del umbral de alerta (90%).

### 🔍 Hallazgos
- Más de la mitad de los incidentes (54%) son de riesgo **Alto**, no Crítico — esto sugiere que la mayoría de ataques son detectados y contenidos antes de escalar al nivel máximo.
- La tendencia de incidentes **crece entre 2022 y 2024** y luego empieza a descender en 2025–2026, lo que puede indicar mejoras en controles preventivos.
- El **10% sin respuesta** equivale a **50 incidentes activos sin gestión** — un riesgo latente que exige atención inmediata.

### 💡 Propuestas
1. **Reducir el tiempo de resolución a < 48 horas.** Actualmente 60.80 h supera las 2 jornadas laborales. Implementar un SLA interno de 48 h con alerta automática al tercer turno sin respuesta.
2. **Cerrar los 50 incidentes sin respuesta** como primera acción de impacto. Priorizar los de riesgo Crítico (84 casos).
3. Implementar un **semáforo de riesgo dinámico** actualizado diariamente, de forma que el indicador de 39.40% sea visible a nivel ejecutivo en tiempo real.

---

## Página 2: Análisis Geográfico

### Datos Clave
- **10 países analizados** en Latinoamérica y Europa.
- **Colombia lidera en volumen:** 72 incidentes totales.
- **México lidera en criticidad:** 14 incidentes críticos (el mayor número absoluto del dataset).
- **Panamá:** 68 incidentes con 12 críticos — segunda posición en ambas métricas.
- **España:** 19 incidentes — el país menos afectado del dataset.
- Ataque recurrente en todos los países: **Suplantación de DNS (DNS Spoofing)**.

### 🔍 Hallazgos
- México y Panamá juntos concentran **28 de los 84 incidentes críticos totales (33.3%)** del dataset, pero solo representan el 27.2% de los incidentes globales — su tasa de criticidad es **desproporcionadamente alta.**
- Ecuador y España son los países con menor exposición, pero sus pocos incidentes incluyen casos de nivel crítico, lo que indica que ningún país está completamente libre de riesgos graves.
- El DNS Spoofing domina en **todos los países** como el vector de entrada más frecuente — es una amenaza sistémica de infraestructura, no puntual.

### 💡 Propuestas
1. **Reforzar controles en México y Panamá** con auditorías de configuración de DNS y políticas DNSSEC obligatorias, ya que son los países con mayor concentración de incidentes críticos.
2. Desarrollar un **plan de respuesta regionalizado**: Colombia necesita volumen de analistas asignados; México necesita analistas con capacidad para escalar incidentes críticos.
3. Implementar **monitoreo de DNS en tiempo real** (herramientas como Cisco Umbrella o DNS Guardian) en todas las geografías para bloquear el vector de ataque más común.

---

## Página 3: Análisis de Ataques

### Datos Clave
| Tipo de Ataque | Incidentes | Tiempo Prom. Resolución |
|---|---|---|
| Malware Infostealer (Robo de Credenciales) | **65** | 60.67 h |
| Spear Phishing a Altos Ejecutivos | **61** | 63.10 h |
| Ataque de Fuerza Bruta SSH | **54** | **55.30 h** (más rápido) |
| DDoS Volumétrico | **53** | 58.36 h |
| Ransomware con Cifrado de Servidores | **53** | **64.67 h** (más lento) |
| Suplantación de DNS | **49** | 63.16 h |

- **Vulnerabilidades más explotadas:** CVE-2021-34527 (*PrintNightmare*, Crítica), CVE-2024-3094 (*XZ Utils Backdoor*, Crítica), ambas con 19 incidentes asociados.
- La CVE **más explotada de todas:** CVE-2022-41352 (*Zimbra RCE*, Alta) — **20 incidentes en su haber.**

### 🔍 Hallazgos
- El **Ransomware con Cifrado de Servidores** no es el ataque más frecuente pero **es el más costoso en tiempo** (64.67 h) — representa un riesgo operativo de alto impacto que inmoviliza sistemas completos.
- El **Malware Infostealer** es el más común (65 casos) y ataca principalmente al sector bancario. Su objetivo son las credenciales, lo que convierte cada incidente en una potencial brecha de datos masiva.
- El ataque de **Fuerza Bruta SSH** es el que se resuelve más rápido (55.30 h) — indica que los equipos están bien preparados para este tipo de amenaza, lo que puede ser un modelo a replicar en otros vectores.
- **Ningún ataque baja de los 30 incidentes** — no hay vectores marginales. Todos los 10 tipos de ataque del catálogo están siendo activamente usados por los adversarios.

### 💡 Propuestas
1. **Prioridad #1 — Parchear las CVEs críticas activas:** PrintNightmare y XZ Utils Backdoor siguen siendo explotadas. Ejecutar inmediatamente un ciclo de parcheo forzado en todos los servidores Windows y sistemas Linux afectados.
2. **Reducir el tiempo de resolución del Ransomware** implementando playbooks de respuesta automatizada (SOAR) con aislamiento de red inmediato al detectar patrones de cifrado masivo.
3. **Replicar el protocolo de Fuerza Bruta SSH** (el más rápido de resolver) como modelo para otros ataques: documentar el proceso, automatizar el bloqueo de IPs y establecer reglas SIEM equivalentes para Malware y DNS Spoofing.

---

## Página 4: Equipo de Respuesta

### Datos Clave
- **150 analistas activos** gestionando los 450 incidentes respondidos.
- Promedio de carga: **3.00 incidentes por analista.**
- **Rosa Guerrero:** analista líder con **16 incidentes gestionados** — el doble del siguiente (8).
- Tiempo promedio por rol:
  - **Admin:** 57.93 h (más rápido, 160 casos gestionados)
  - **Auditor:** 62.24 h (124 casos)
  - **Analista:** 62.48 h (166 casos)
- El gráfico de caja (*box plot*) muestra que todos los tipos de ataque tienen **alta variabilidad** en tiempos de resolución — algunos casos se extienden hasta las 120+ horas.

### 🔍 Hallazgos
- **La carga está concentrada en muy pocos analistas.** Rosa Guerrero gestiona el doble que sus pares — esto es insostenible y crea un riesgo de *burnout* y cuello de botella.
- Los **admins resuelven 4.55 horas más rápido** que analistas y auditores — sugiere que los incidentes escalados a nivel admin tienen protocolos más eficientes o más acceso a herramientas.
- La **alta dispersión en el box plot** indica que no existe un proceso estándar de resolución — la velocidad de cierre depende del analista individual, no de un procedimiento documentado.
- Los **50 incidentes sin respuesta** representan casos que ninguno de los 150 analistas ha atendido todavía — posible brecha en el sistema de asignación.

### 💡 Propuestas
1. **Redistribuir la carga de Rosa Guerrero** y elevar su perfil como *Team Lead* o mentora, documentando su proceso para que otros analistas lo repliquen.
2. Implementar **asignación automática de incidentes** (round-robin + prioridad de riesgo) para evitar concentración en un solo analista y garantizar que los 50 sin respuesta se asignen de inmediato.
3. Crear **playbooks de resolución estandarizados** por tipo de ataque, basados en los protocolos que usan los admins. Meta: reducir la variabilidad y llevar el tiempo promedio de los analistas de 62.48 a < 58 h.

---

## Página 5: Análisis Empresarial *(ACTUALIZADO)*

### Datos Clave
- **50 empresas afectadas** en total.
- Incidentes por tamaño: **Pequeña: 205 (41%)**, Grande: 178 (35.6%), Mediana: 117 (23.4%).
- **Empresa con más incidentes:** Solutions Systems Services (Panamá, Grande) — **16 incidentes.**
- **Empresa con más casos resueltos:** **Nova Cyber Ltda** (Perú, Mediana) — **14 de 15 incidentes resueltos** (tasa de resolución del 93.3%).
- En la tabla visible del dashboard, **8 empresas tienen exactamente 14 incidentes**, lo que indica una distribución de carga relativamente uniforme entre las más expuestas.

### 🔍 Hallazgos de la Matriz de Impacto por Sector
| Sector | Financiero | Operativo | Reputacional | Total |
|---|---|---|---|---|
| **Banca** | 31 | **51** ⚠️ | 39 | **121** |
| **Tecnología** | 33 | 38 | 37 | **108** |
| **Gobierno** | 30 | 35 | **38** | **103** |
| Educación | 32 | 29 | 23 | 84 |
| Salud | **37** ⚠️ | 21 | 26 | 84 |

**Hallazgos críticos:**
- **Banca:** El impacto operativo (51 casos) **supera por 20 puntos** al financiero y al reputacional — significa que los ataques en banca no solo roban datos, sino que **paralizan operaciones directamente.** Ataque principal: *Malware Infostealer* (16 casos) → amenaza directa a credenciales de clientes.
- **Salud:** Tiene el **menor número de incidentes** (84) pero el **mayor impacto financiero** (37 casos). Cada incidente en salud cuesta más dinero que en cualquier otro sector — probablemente por multas regulatorias y costos de recuperación de sistemas hospitalarios.
- **Gobierno:** Lidera en impacto **reputacional** (38 casos) — consistente con el hecho de que su ataque #1 sea el *Spear Phishing a Altos Ejecutivos* (18 casos), cuyo objetivo es comprometer a figuras de autoridad pública.
- **Tecnología:** El único sector donde los **3 tipos de impacto están casi equiparados** (33/38/37) — sugiere que las empresas tech son atacadas de múltiples ángulos simultáneamente.

### 🔍 Hallazgos del Flujo de Ataques (Sankey)
- **Banca** recibe los ataques más diversificados: Robo de Credenciales, Spear Phishing, Fuga Interna, DNS Spoofing y Fuerza Bruta SSH — prácticamente todo el catálogo.
- **Gobierno** es el sector más atacado con Spear Phishing (18 casos) — el doble del siguiente sector.
- Las **empresas pequeñas** son el blanco más frecuente (205 incidentes), probablemente por menores controles de seguridad.
- **Nova Cyber Ltda** (tooltip): empresa mediana de Perú con 15 incidentes y solo **2 incidentes de la empresa sin resolver** — el ratio de resolución más eficiente del dataset (93.3%). Puede ser un modelo a seguir para medianas empresas.

### 💡 Propuestas
1. **Focalizar controles en empresas pequeñas.** Con 205 incidentes (41% del total) y presumiblemente menos presupuesto de seguridad, este segmento necesita programas de ciberseguridad accesibles: MFA obligatorio, capacitación anti-phishing y monitoreo gestionado (MSSP).
2. **Auditar las 8 empresas con 14 incidentes** para identificar si comparten vulnerabilidades comunes (mismas CVEs explotadas, mismo proveedor de infraestructura, misma región).
3. **Crear un programa de buenas prácticas basado en Nova Cyber Ltda.** Su tasa de resolución del 93.3% es la más alta del dataset. Documentar su proceso interno de gestión y replicarlo en otras medianas empresas del sector tecnológico.
4. **Plan de protección sectorial diferenciado:**
   - **Banca:** Implementar detección de anomalías en accesos y credenciales (EDR + SIEM).
   - **Salud:** Priorizar cifrado de datos de pacientes y segmentación de redes hospitalarias para reducir el impacto financiero regulatorio.
   - **Gobierno:** Programa urgente de concientización y simulacros de *spear phishing* para funcionarios de alto rango.
   - **Tecnología:** Auditoría de superficie de ataque completa, ya que los tres tipos de impacto están distribuidos igualmente.
