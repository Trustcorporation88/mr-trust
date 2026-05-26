@echo off
REM Deploy Services Catalog to Vercel - Windows Quick Start Script
REM Usage: deploy-vercel.cmd

setlocal enabledelayedexpansion

echo.
echo 🚀 Services Catalog Vercel Deployment
echo ======================================
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI nao encontrado
    echo    Instale com: npm install -g vercel
    exit /b 1
)

REM Change to script directory
cd /d "%~dp0"

REM Step 1: Show current branch
echo.
echo 🌿 Status Git:
git rev-parse --abbrev-ref HEAD
git log --oneline -1
echo.

REM Step 2: Check if .vercel folder exists
if not exist ".vercel" (
    echo ⚠️  Projeto Vercel nao linkado
    echo    Execute: vercel link
    echo.
    set /p confirm="Continuar com novo link? (s/n): "
    if /i "!confirm!"=="s" (
        vercel link
    )
)

REM Step 3: Deploy
echo.
echo 📦 Iniciando deploy no Vercel...
echo.

vercel deploy --prod

echo.
echo ✅ Deploy iniciado!
echo    Acompanhe em: https://vercel.com/dashboard
echo.
echo 📋 Proximas etapas:
echo    1. Configure variaveis de ambiente no Painel Vercel
echo    2. Verifique a URL de deployment
echo    3. Teste a rota /services
echo.
pause
