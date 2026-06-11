param(
    [string]$PostgresPassword = "root",
    [string]$PostgresUser = "postgres",
    [string]$Host = "localhost",
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir

$psqlPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
)
$psql = $psqlPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psql) {
    throw "psql introuvable. Installez PostgreSQL ou ajoutez psql au PATH."
}

$env:PGPASSWORD = $PostgresPassword
Write-Host "Creation de l'utilisateur et de la base adoul_ai..." -ForegroundColor Cyan

& $psql -U $PostgresUser -h $Host -p $Port -d postgres -f (Join-Path $scriptDir "init_db.sql")
if ($LASTEXITCODE -ne 0) { throw "Echec init_db.sql" }

# Copier .env si absent
$envFile = Join-Path $backendDir ".env"
$envExample = Join-Path $backendDir ".env.example"
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
    Copy-Item $envExample $envFile
    Write-Host ".env cree depuis .env.example" -ForegroundColor Green
}

Push-Location $backendDir
try {
    if (Test-Path ".\venv\Scripts\activate.ps1") {
        Write-Host "Application des migrations..." -ForegroundColor Cyan
        & .\venv\Scripts\python.exe -m flask db upgrade
        if ($LASTEXITCODE -ne 0) { throw "Echec flask db upgrade" }
        Write-Host "Base initialisee avec succes." -ForegroundColor Green
        Write-Host ""
        Write-Host "Lancez le backend :" -ForegroundColor Yellow
        Write-Host "  cd backend" -ForegroundColor White
        Write-Host "  .\venv\Scripts\activate" -ForegroundColor White
        Write-Host "  python run.py" -ForegroundColor White
    } else {
        Write-Host "venv absent. Apres activation du venv, executez :" -ForegroundColor Yellow
        Write-Host "  flask db upgrade" -ForegroundColor White
    }
} finally {
    Pop-Location
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
