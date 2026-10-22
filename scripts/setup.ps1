# FreshmCalc Windows PowerShell setup
# Run in an elevated PowerShell console.

$ErrorActionPreference = "Stop"

Write-Host "=== FreshmCalc Setup (PowerShell) ===" -ForegroundColor Cyan

# 1. Prerequisites check
Write-Host "Checking prerequisites..."
foreach ($cmd in @('java','gradle','node','npm','docker')) {
  if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Warning "$cmd not found. Please install it first."
  }
}

# 2. Backend
Write-Host "Setting up backend..."
Push-Location backend
if (!(Test-Path ".env")) {
  New-Item -Path ".env" -Value @"
DB_URL=jdbc:postgresql://localhost:5432/freshmcalc
DB_USERNAME=freshmcalc
DB_PASSWORD=freshmcalc
JWT_SECRET=change-me-in-production
RAZORPAY_TEST_MODE=true
"@ -Force
}
Write-Host "Backend ready. Run: ./gradlew bootRun" -ForegroundColor Green
Pop-Location

# 3. Frontend
Write-Host "Setting up frontend..."
Push-Location frontend
if (!(Test-Path ".env")) {
  New-Item -Path ".env" -Value "VITE_API_BASE=/api/v1" -Force
}
npm install
Write-Host "Frontend ready. Run: npm run dev" -ForegroundColor Green
Pop-Location

# 4. Docker Compose (optional full stack)
Write-Host "To run the full stack with Docker: cd infrastructure && docker compose up --build" -ForegroundColor Cyan

Write-Host "=== Setup complete ===" -ForegroundColor Green
