@echo off
REM Services Catalog - Quick Validation Test (Windows)
REM Testa se a API e o frontend estão funcionando

setlocal enabledelayedexpansion

echo.
echo ================================
echo Services Catalog - Teste Rapido
echo ================================
echo.

REM Colors (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Test 1: Verificar se servidor está rodando
echo [1/5] Verificando se servidor esta rodando...
timeout /t 1 /nobreak > nul
curl -s http://localhost:3000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Servidor esta online
) else (
    echo ERRO - Servidor nao respondeu
    echo Inicie com: npm start
    exit /b 1
)
echo.

REM Test 2: Teste endpoint /api/v1/services
echo [2/5] Testando GET /api/v1/services...
curl -s http://localhost:3000/api/v1/services | find "total" > nul
if %errorlevel% equ 0 (
    echo OK - API retornou dados
) else (
    echo ERRO - API nao retornou dados validos
    exit /b 1
)
echo.

REM Test 3: Teste obter serviço específico
echo [3/5] Testando GET /api/v1/services/create_deal...
curl -s http://localhost:3000/api/v1/services/create_deal | find "create_deal" > nul
if %errorlevel% equ 0 (
    echo OK - Servico encontrado
) else (
    echo ERRO - Servico nao encontrado
    exit /b 1
)
echo.

REM Test 4: Teste filtro por categoria
echo [4/5] Testando GET /api/v1/services/category/vendas...
curl -s http://localhost:3000/api/v1/services/category/vendas | find "vendas" > nul
if %errorlevel% equ 0 (
    echo OK - Categoria encontrada
) else (
    echo ERRO - Categoria nao encontrada
    exit /b 1
)
echo.

REM Test 5: Verificar arquivo JSON
echo [5/5] Verificando arquivo services-catalog.json...
if exist "server\services-catalog.json" (
    echo OK - Arquivo encontrado
) else (
    echo ERRO - Arquivo nao encontrado
    echo Procure em: server\services-catalog.json
    exit /b 1
)
echo.

REM Resultado Final
echo ================================
echo. OK - Testes concluidos com sucesso!
echo.
echo Proximos Passos:
echo   1. Abra: http://localhost:3000/services
echo   2. Explore os 11 servicos
echo   3. Clique em um card para ver instrucoes
echo   4. Consulte SERVICES_CATALOG_GUIDE.md
echo.
echo Links Uteis:
echo   - API Base: http://localhost:3000/api/v1/services
echo   - Frontend: http://localhost:3000/services
echo   - Documentacao: SERVICES_CATALOG_GUIDE.md
echo.

pause
