$ErrorActionPreference = "Continue"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Iniciando Pipeline de Seguridad - NextAuditAI" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Crear carpeta para reportes si no existe
$ReportDir = "$PWD\reportes_seguridad"
if (-Not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
}

# 1. Semgrep (SAST)
Write-Host "`n[+] 1. Ejecutando Semgrep (SAST)..." -ForegroundColor Yellow
# Asume que ya hiciste: pip install semgrep
try {
    semgrep --config p/owasp-top-ten --json --output "$ReportDir\sast.json" .
} catch {
    Write-Host "Error al ejecutar Semgrep. Asegurate de instalarlo con: pip install semgrep" -ForegroundColor Red
}

# 2. OWASP Dependency-Check (SCA) - DESACTIVADO TEMPORALMENTE PARA EL LAB
Write-Host "`n[+] 2. Saltando OWASP Dependency-Check (SCA) por demora de NVD..." -ForegroundColor Yellow
# docker run --rm -v ${PWD}:/src -v ${PWD}/reportes_seguridad:/reportes owasp/dependency-check --scan /src/backend --scan /src/frontend --format HTML --format JSON --out /reportes

# 3. OWASP ZAP (DAST)
Write-Host "`n[+] 3. Ejecutando OWASP ZAP (DAST)..." -ForegroundColor Yellow
Write-Host ">>> NOTA: La aplicacion de NextAuditAI debe estar corriendo (start-dev.ps1)." -ForegroundColor Magenta
Write-Host ">>> ZAP atacara http://host.docker.internal:4200 (tu frontend local)." -ForegroundColor Magenta
# Atacamos el frontend local desde dentro del contenedor usando host.docker.internal
docker run --rm -v ${PWD}/reportes_seguridad:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:4200 -r zap_report.html

# 4. Trivy (Escaneo de Contenedores)
Write-Host "`n[+] 4. Ejecutando Trivy (Escaneo de Contenedores)..." -ForegroundColor Yellow
# Como NextAuditAI usa Postgres (segun vimos en tu docker-compose), escanearemos esa imagen base 
# Puedes cambiar 'postgres:15' por la imagen real si empaquetas NextAudit en Docker en el futuro.
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image postgres:15 --severity HIGH,CRITICAL -f table > "$ReportDir\trivy.txt"

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host " Pipeline Finalizado. Reportes en: $ReportDir" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
