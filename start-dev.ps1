# Script para iniciar el entorno de desarrollo local de NextAudit AI

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     Iniciando entorno NextAudit AI             " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Iniciar los contenedores de base de datos y redis
Write-Host "1. Levantando contenedores de Docker (Postgres y Redis)..." -ForegroundColor Yellow
docker compose -f backend\ops\compose\compose.dev.yml up -d

Write-Host "   Esperando 5 segundos para que la base de datos este lista..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

# 2. Iniciar el Backend en una nueva ventana
Write-Host "2. Iniciando Backend (NestJS) en una nueva ventana..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; Write-Host 'Iniciando Backend...'; npm run start:dev:api`""

# 3. Iniciar el Frontend en una nueva ventana
Write-Host "3. Iniciando Frontend (Angular) en una nueva ventana..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend\nextaudit-app; Write-Host 'Iniciando Frontend...'; npm start`""

Write-Host "================================================" -ForegroundColor Green
Write-Host " ¡Todo listo! Servicios iniciados exitosamente." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Frontend disponible en: http://localhost:4200"
Write-Host "Backend  disponible en: http://localhost:3000"
Write-Host "Puedes cerrar esta ventana, las otras dos mantendran los servidores corriendo."
