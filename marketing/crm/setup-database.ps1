# PostgreSQL Database Setup para MEISHOP CRM
# Este script cria a database e executa o schema automaticamente

param(
    [string]$PostgresVersion = "18",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$DBName = "meishop_crm",
    [string]$DBHost = "localhost"
)

$PostgresBin = "C:\Program Files\PostgreSQL\$PostgresVersion\bin"
$DatabaseSqlPath = "C:\Mr.Holmes\marketing\crm\database.sql"

Write-Host "========================================"
Write-Host "  MEISHOP CRM - PostgreSQL Setup"
Write-Host "========================================"
Write-Host ""

# Verificar se PostgreSQL existe
if (-not (Test-Path $PostgresBin)) {
    Write-Host "[ERROR] PostgreSQL nao encontrado em $PostgresBin"
    Write-Host "   Instale em: https://www.postgresql.org/download/windows/"
    exit 1
}

Write-Host "[OK] PostgreSQL $PostgresVersion encontrado em: $PostgresBin"
Write-Host ""

# Verificar se database.sql existe
if (-not (Test-Path $DatabaseSqlPath)) {
    Write-Host "[ERROR] Arquivo database.sql nao encontrado em $DatabaseSqlPath"
    exit 1
}

Write-Host "[OK] database.sql encontrado"
Write-Host ""

# Preparar variáveis de ambiente
$env:PGPASSWORD = $DBPassword
$psqlPath = "$PostgresBin\psql.exe"

Write-Host "Conectando ao PostgreSQL como '$DBUser'..."
Write-Host ""

try {
    # Verificar conexao
    Write-Host "  -> Verificando conexao ao PostgreSQL..."
    & $psqlPath -U $DBUser -h $DBHost -c "SELECT version();" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Conexao OK"
    } else {
        throw "Nao conseguiu conectar ao PostgreSQL"
    }

    # Verificar se database ja existe
    Write-Host ""
    Write-Host "  -> Verificando se database '$DBName' ja existe..."
    $dbExists = & $psqlPath -U $DBUser -h $DBHost -l 2>&1 | Select-String $DBName
    
    if ($dbExists) {
        Write-Host "  [WARN] Database '$DBName' ja existe"
        Write-Host "  -> Dropando database existente..."
        & $psqlPath -U $DBUser -h $DBHost -c "DROP DATABASE IF EXISTS $DBName;" 2>&1 | Out-Null
        Write-Host "  [OK] Database removido"
    }

    # Criar database
    Write-Host ""
    Write-Host "  -> Criando database '$DBName'..."
    & $psqlPath -U $DBUser -h $DBHost -c "CREATE DATABASE $DBName;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Database criado"
    } else {
        throw "Erro ao criar database"
    }

    # Executar schema
    Write-Host ""
    Write-Host "  -> Executando schema (database.sql)..."
    $sqlContent = Get-Content $DatabaseSqlPath -Raw
    $sqlContent | & $psqlPath -U $DBUser -h $DBHost -d $DBName 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Schema aplicado"
    } else {
        throw "Erro ao executar schema"
    }

    # Verificar tabelas criadas
    Write-Host ""
    Write-Host "  -> Verificando tabelas criadas..."
    $tables = & $psqlPath -U $DBUser -h $DBHost -d $DBName -c "\dt" -q
    $tableCount = ($tables | Measure-Object -Line).Lines - 2
    
    Write-Host "  [OK] Tabelas criadas: $tableCount"

    Write-Host ""
    Write-Host "========================================"
    Write-Host "  DATABASE PRONTO!"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Proximos passos:"
    Write-Host "  1. Abrir novo terminal PowerShell"
    Write-Host "  2. cd 'C:\Mr.Holmes\marketing\crm\server'"
    Write-Host "  3. npm run dev"
    Write-Host ""
    Write-Host "  Em outro terminal:"
    Write-Host "  1. cd 'C:\Mr.Holmes\marketing\crm\frontend'"
    Write-Host "  2. npm run dev"
    Write-Host ""
    Write-Host "  Browser: http://localhost:5173"
    Write-Host "  Login: admin@meishop.com / admin123"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] $_"
    Write-Host ""
    exit 1
} finally {
    # Limpar variável de ambiente
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}
