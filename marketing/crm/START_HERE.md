# 🚀 MEISHOP CRM - Guia de Início Rápido

## ✅ Status Atual

- ✅ **Backend**: Instalado e respondendo em http://localhost:3000
- ✅ **Frontend**: Pronto para instalar
- ⚠️ **Database**: Precisa ser criado (PostgreSQL)

---

## 📋 Pré-requisitos (Verificar)

### 1️⃣ PostgreSQL
```bash
# Windows: Verificar se PostgreSQL está rodando
# Services → postgresql-x64-14 (ou similar)
# Ou tente:
psql --version
```

Se não estiver instalado:
- Download: https://www.postgresql.org/download/windows/
- Instalar com default password: `postgres`

---

## 🗄️ Criar Database (Execute APENAS UMA VEZ)

### Opção 1: Via psql (Command Prompt do Windows)
```powershell
# Abrir Command Prompt como Administrador
cd "C:\Program Files\PostgreSQL\15\bin"  # Ajuste a versão

# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE meishop_crm;
\c meishop_crm
\i 'C:\Mr.Holmes\marketing\crm\database.sql'
\q
```

### Opção 2: Via pgAdmin (Interface Gráfica)
1. Abrir pgAdmin → Right-click em "Databases" → Create → Database
2. Name: `meishop_crm`
3. Create
4. Abrir Query Tool
5. Copy-paste conteúdo de `database.sql`
6. Execute

### Opção 3: Via Script (Windows PowerShell)
```powershell
$dbName = "meishop_crm"
$dbUser = "postgres"
$dbPass = "postgres"

# Verificar se PostgreSQL está acessível
psql -U $dbUser -c "SELECT 1"

# Se der erro, PostgreSQL não está no PATH
# Neste caso, use as opções 1 ou 2 acima
```

---

## 🎯 Iniciar Backend (Terminal 1)

```powershell
# Abrir PowerShell
cd 'C:\Mr.Holmes\marketing\crm\server'

# Instalar dependências (primeira vez)
npm install

# Iniciar servidor
npm run dev

# Esperado output:
# [nodemon] starting `node server.js`
# ✓ Database connected successfully
# ✓ Server running on http://localhost:3000
```

**MANTER ESTE TERMINAL ABERTO**

---

## 🎨 Iniciar Frontend (Terminal 2)

```powershell
# Abrir nova aba do PowerShell / Terminal
cd 'C:\Mr.Holmes\marketing\crm\frontend'

# Instalar dependências (primeira vez)
npm install

# Criar .env se não existir
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local

# Iniciar servidor
npm run dev

# Esperado output:
# ✓ Local: http://localhost:5173
# ✓ Browser abre automaticamente
```

---

## 🌐 Acessar Aplicação

### 1. Browser abre automaticamente em:
```
http://localhost:5173
```

### 2. Login
```
Email: admin@meishop.com
Password: admin123
```

### 3. Dashboard carrega com:
- 📊 KPIs
- 👥 Clientes
- Menu no lado esquerdo

---

## 🧪 Testar Features (Após Login)

### 📈 Pipeline (Deals - Kanban)
```
Dashboard → Clique em "Pipeline" na nav esquerda
↓
Clique em "Nova Oportunidade"
↓
Preencha: Título, Cliente, Valor, Data Prevista
↓
Crie deal
↓
Arraste entre as colunas (stages)
```

### 🎫 Tickets (SLA)
```
Dashboard → Clique em "Tickets"
↓
Clique em "Novo Ticket"
↓
Preencha: Título, Cliente, Prioridade (High/Medium/Low)
↓
Sistema calcula SLA automaticamente:
   - High: 4 horas
   - Medium: 24 horas
   - Low: 72 horas
↓
Veja status com cores:
   - 🔴 Vencido (Overdue)
   - ⚠️  Crítico (1h restante)
   - ✅ OK
```

### 📢 Campanhas (ROI)
```
Dashboard → Clique em "Campanhas"
↓
Clique em "Nova Campanha"
↓
Preencha: Nome, Tipo (Email/SMS/Social), Budget
↓
Adicione Revenue manualmente
↓
Sistema calcula automaticamente:
   - ROI %
   - CPL (Cost per Lead)
   - CPD (Cost per Deal)
   - Conversion Rate
   - LTV (Lifetime Value)
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Cannot find PostgreSQL"
**Solução:**
1. Verificar se PostgreSQL está instalado
2. Se estiver, adicionar ao PATH do Windows
3. Ou usar pgAdmin em vez de psql

### ❌ Erro: "Database does not exist"
**Solução:**
1. Verificar se database `meishop_crm` foi criado
2. Rodar script `database.sql` novamente
3. Confirmar credenciais em `server/.env`:
   ```
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=meishop_crm
   ```

### ❌ Erro: "Connection refused" no frontend
**Solução:**
1. Verificar se backend está rodando em Terminal 1
2. Verificar se porta 3000 não está sendo usada por outro processo
3. Mudar para porta diferente em `.env`:
   ```
   PORT=3001
   ```

### ❌ Frontend não conecta ao backend
**Solução:**
1. Verificar `.env.local` no frontend:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```
2. Se mudou porta do backend, atualizar aqui também
3. Limpar browser cache: Ctrl+Shift+Delete → Clear All

### ❌ "Port 5173 already in use"
**Solução:**
1. Mudar porta no `frontend/vite.config.js`:
   ```javascript
   server: {
     port: 5174  // Usar porta diferente
   }
   ```
2. Ou matar processo usando porta 5173:
   ```powershell
   lsof -ti:5173 | xargs kill -9
   ```

---

## 📞 Verificar Status

### Backend está rodando?
```bash
curl http://localhost:3000/health
# Esperado: {"status":"error"...} ou {"status":"ok"}
```

### Frontend está rodando?
```bash
curl http://localhost:5173
# Esperado: HTML da aplicação
```

### Database está conectado?
```bash
psql -U postgres -d meishop_crm -c "SELECT COUNT(*) FROM customers;"
# Esperado: Número de clientes
```

---

## 🎓 Documentação Completa

Para detalhes técnicos, consulte:
- **IMPLEMENTATION_OPTION_B.md** - Feature details
- **RUN_GUIDE.md** - API endpoints & examples
- **SETUP_GUIDE.md** - Deployment guide

---

## ⏱️ Tempo Esperado

| Etapa | Tempo |
|-------|-------|
| PostgreSQL setup | 2-5 min |
| Backend `npm install` | 1 min |
| Backend start | 10 seg |
| Frontend `npm install` | 2 min |
| Frontend start | 5 seg |
| **TOTAL** | **~10 minutos** |

---

## ✨ Next Steps

Após confirmar que tudo está rodando:

1. **Criar Dados de Teste**
   - Clientes → Criar cliente teste
   - Deals → Criar oportunidade
   - Tickets → Criar ticket com alta prioridade

2. **Testar SLA Tracking**
   - Criar ticket High priority
   - Verificar SLA deadline (NOW + 4h)
   - Esperar 1 minuto, refetch para ver countdown

3. **Testar Kanban Drag-Drop**
   - Criar deal
   - Arrastar entre stages
   - Confirmar que status muda

4. **Testar ROI Analytics**
   - Criar campanha com budget
   - Adicionar deals relacionados
   - Ver ROI % se Revenue > Budget

---

## 🆘 Problemas? 

Verifique em ordem:
1. ✅ PostgreSQL está rodando? (Services)
2. ✅ Database `meishop_crm` foi criado?
3. ✅ Backend mostra "Database connected"?
4. ✅ Frontend consegue fazer login?
5. ✅ Consegue navegar para Pipeline/Tickets/Campanhas?

Se problema continuar, abra issue com:
- Terminal 1 (backend) outputs
- Terminal 2 (frontend) errors
- Browser console (F12) errors

---

**Boa sorte! 🚀 Qualquer dúvida, consulte RUN_GUIDE.md**
