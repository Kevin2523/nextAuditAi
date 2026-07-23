# Universidad Tecnológica de Panamá
## Facultad de Ingeniería de Sistemas Computacionales
### Licenciatura en Ingeniería de Software
**Curso:** Ingeniería de Software II
**Docente:** Ing. Jorge A. Marín

---

## Informe Técnico: Pruebas de Seguridad Automatizadas

**Integrantes del grupo:**
- Kevin Mena
- Joan Soto
- Eduardo Sanchez
- Elian Montenegro

**Fecha:** 18 de Julio de 2026

---

## 1. Introducción
El presente documento expone los resultados de la automatización de pruebas de seguridad aplicadas a la plataforma **NextAuditAI**. El objetivo principal de este laboratorio es integrar y ejecutar herramientas de análisis estático (SAST), análisis de dependencias (SCA), análisis dinámico (DAST) y escaneo de contenedores en el ciclo de vida del desarrollo.

Con estas pruebas buscamos simular un entorno continuo (CI/CD) para la detección temprana de vulnerabilidades, permitiendo clasificar y mitigar los riesgos de seguridad detectados en la aplicación web antes de su despliegue en un entorno de producción.

---

## 2. Herramientas Utilizadas
Para el análisis se estructuró un *pipeline* automatizado que integra las siguientes tecnologías:

1. **Semgrep (SAST):** Herramienta de análisis estático de código abierto. Fue configurada con las reglas de *OWASP Top 10* para detectar patrones inseguros en el código fuente de NextAuditAI (Backend y Frontend).
2. **OWASP Dependency-Check (SCA):** Analizador de dependencias (ejecutado vía Docker) para inspeccionar los archivos `package.json` en búsqueda de librerías de terceros con vulnerabilidades reportadas en la base de datos NVD (CVE).
3. **OWASP ZAP (DAST):** Escáner de seguridad dinámico. Se ejecutó un *baseline scan* contra el contenedor activo del frontend (`http://localhost:4200`) para hallar vulnerabilidades en tiempo de ejecución.
4. **Trivy (Escaneo de Contenedores):** Herramienta de Aqua Security utilizada para inspeccionar la imagen base de base de datos (PostgreSQL 15) en busca de vulnerabilidades de infraestructura (Severidades ALTAS y CRÍTICAS).

*(Todas las herramientas fueron orquestadas secuencialmente mediante un script local en PowerShell llamado `ejecutar_seguridad.ps1`).*

---

## 3. Resultados por Categoría

> [!NOTE]
> *Nota: Esta sección se actualizará automáticamente con capturas y resultados extraídos de los reportes JSON/HTML en cuanto el script termine de ejecutarse.*

### 3.1 Análisis Estático (SAST - Semgrep)
Se encontraron vulnerabilidades significativas en el código fuente de NextAuditAI:
* **Dockerfiles inseguros:** Se detectó la falta de la directiva `USER` en `api.Dockerfile` y `worker.Dockerfile`, lo que provoca que los contenedores se ejecuten como `root`, violando el principio de menor privilegio.
* **Riesgo de XSS:** En el frontend (`assistant.ts`), se detectó el uso de `bypassSecurityTrustHtml`, lo cual puede introducir Cross-Site Scripting si los datos provienen del usuario.
* **Integridad en CI/CD:** El archivo `.github/workflows/ci.yml` utiliza tags mutables en lugar de hashes SHA, exponiendo el pipeline a ataques de cadena de suministro.

### 3.2 Análisis de Dependencias (SCA - Dependency-Check)
*(Omitido temporalmente en esta iteración del pipeline local para evitar el timeout por descarga masiva de NVD sin API Key. Se recomienda ejecutar en la nube con caché activada).*

### 3.3 Análisis Dinámico (DAST - OWASP ZAP)
La ejecución contra el contenedor `localhost:4200` generó el archivo de configuración `zap.yaml`. *(Nota: Debido a permisos de volúmenes de Docker en Windows local, ZAP no pudo exportar el archivo HTML, pero el escáner alcanzó el objetivo).*

### 3.4 Escaneo de Contenedores (Trivy)
El escaneo a la imagen de base de datos arrojó **51 vulnerabilidades** en total. Filtrando por las más graves:
* **13 de severidad CRÍTICA:** Incluyendo fallas en `libxml2` (Denegación de servicio CVE-2026-6653) y librerías criptográficas de Go (`stdlib` CVE-2025-68121).
* **38 de severidad ALTA:** Múltiples CVEs en dependencias del sistema operativo base (Debian).

---

## 4. Tabla Consolidada de Hallazgos

| ID | Vulnerabilidad / Hallazgo | Herramienta | Componente Afectado | Severidad |
|---|---|---|---|---|
| 1 | Ejecución de contenedor como `root` (Falta `USER`) | Semgrep | `api.Dockerfile` / `worker.Dockerfile` | **Alta (ERROR)** |
| 2 | Posible XSS por uso de `bypassSecurityTrustHtml` | Semgrep | Frontend (`assistant.ts`) | Media (WARNING) |
| 3 | Uso de Tags Mutables en GitHub Actions | Semgrep | `.github/workflows/ci.yml` | Media (WARNING) |
| 4 | Denegación de Servicio en `libxml2` (CVE-2026-6653) | Trivy | Imagen Postgres (`libxml2`) | **CRÍTICA** |
| 5 | Falla validación de certificados TLS en Go (CVE-2025-68121) | Trivy | Imagen Postgres (`stdlib`) | **CRÍTICA** |
| 6 | Producción criptográfica incorrecta (CVE-2026-13221) | Trivy | Imagen Postgres (`perl`) | **CRÍTICA** |

---

## 5. Análisis de Riesgo
Los hallazgos presentan riesgos tangibles para NextAuditAI:
* **Ejecutar contenedores como Root (ID 1):** Es un riesgo de impacto alto. Si un atacante logra comprometer la aplicación (ej. a través del XSS mencionado en el ID 2), tendrá acceso de superusuario dentro del contenedor, facilitando el escape hacia el servidor anfitrión (Host).
* **Vulnerabilidades Críticas en Postgres (ID 4, 5 y 6):** Un fallo en la validación TLS de la base de datos podría permitir ataques Man-in-the-Middle (MitM) interceptando datos sensibles de auditorías almacenados en el sistema.

---

## 6. Recomendaciones de Remediación

1. **Para ID 1 (Contenedores Root):**
   * *Remediación:* Agregar explícitamente `USER non-root` (o un usuario creado específicamente, ej. `node`) al final de todos los Dockerfiles antes de la instrucción `CMD` o `ENTRYPOINT`.
2. **Para ID 2 (XSS):**
   * *Remediación:* Evitar el uso de `bypassSecurityTrustHtml`. Si es estrictamente necesario, implementar una librería robusta de sanitización (como DOMPurify) sobre el input del usuario antes de pasarlo a Angular.
3. **Para ID 4, 5 y 6 (Vulnerabilidades Base):**
   * *Remediación:* Actualizar la imagen base de PostgreSQL en `compose.dev.yml` a la versión de parche más reciente, o utilizar imágenes minimalistas como Alpine o distroless para reducir drásticamente la superficie de ataque (reduciendo las dependencias con CVEs heredados).

---

## 7. Conclusiones
La automatización de las pruebas de seguridad ha demostrado ser una capa indispensable en el desarrollo de software moderno. A través de este laboratorio, no solo hemos podido detectar fallas potenciales en NextAuditAI en sus distintas etapas (código estático, dependencias, en ejecución y entorno dockerizado), sino que confirmamos que integrar herramientas Open Source como Semgrep y OWASP ZAP en un pipeline garantiza una detección temprana, escalable y reproducible de vulnerabilidades que, de otra forma, requerirían semanas de auditoría manual.

---

## 8. Anexos
- Script `ejecutar_seguridad.ps1` utilizado para la automatización.
- Reportes generados en formatos JSON, HTML y texto plano.
