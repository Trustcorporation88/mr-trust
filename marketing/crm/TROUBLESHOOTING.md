# 🔧 MEISHOP CRM - Troubleshooting Guide

---

## 🎯 Problema #1: Deals e Tickets retornam 0 items

**Sintomas:**
```
GET /api/v1/deals → {"data":[],"total":0}
GET /api/v1/tickets → {"data":[],"total":0}
GET /api/v1/campaigns → {"data":[4 records]} ✅
```

### Diagnóstico

**Passo 1: Verificar se dados existem no database**
```bash
# Conectar ao database
psql -U postgres -d meishop_crm

# Listar dados
SELECT COUNT(*) FROM deals;
SELECT COUNT(*) FROM tickets;
SELECT COUNT(*) FROM campaigns;

# Com company_id específico
SELECT COUNT(*) FROM deals WHERE company_id = '24621fc4-8ee7-457f-a142-7c73aa6eeca5';
```

**Passo 2: Se dados existem no DB**
→ Problema está no **Controller SQL Query**
→ Comparar com Campaigns (que funciona)

**Passo 3: Se dados NÃO existem no DB**
→ Problema está no **seed.js**
→ Executar seed.js novamente com debug

### Solução Rápida

**1. Re-popular database:**
```bash
cd C:\Mr.Holmes\marketing\crm\server
node seed.js
```

**2. Verificar output:**
```
Created 5 demo deals ✓
Created 4 demo tickets ✓
Created 4 demo campaigns ✓
```

**3. Testar endpoints:**
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/v1/deals
```

### Debug Detalhado

Se ainda não funcionar, editar `DealsController.js`:

```javascript
// Adicionar logging antes do response
console.log('Query company_id:', req.user.companyId);
console.log('Query:', query);
console.log('Results:', results.rows);
```

Depois testar e verificar console do backend.

---

## 🎯 Problema #2: GET /api/v1/tickets/metrics retorna 500

**Sintomas:**
```
HTTP 500 Internal Server Error
```

### Diagnóstico

**Passo 1: Verificar erro no console**
```bash
# Olhar saída do servidor no terminal
npm run dev
# Procurar por stack trace com "metrics"
```

**Passo 2: Comum - Erro SQL**
```javascript
// Possível causa: Query incorreta
SELECT COUNT(*) FROM tickets WHERE company_id = $1
// Erro: falta GROUP BY ou alias

// Solução: Verificar sintaxe SQL
```

**Passo 3: Verificar tabelas**
```bash
# Confirmar se tickets_metrics_view existe (se usado)
psql -U postgres -d meishop_crm -c "\dv"
```

### Solução Rápida

Editar `TicketController.js`:

```javascript
// Localizar method: async metrics(req, res)
// Adicionar try-catch:

try {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority
    FROM tickets
    WHERE company_id = $1
  `;
  
  const result = await pool.query(query, [req.user.companyId]);
  res.json(result.rows[0]);
} catch (err) {
  console.error('Metrics error:', err);
  res.status(500).json({ error: err.message });
}
```

---

## 🎯 Problema #3: GET /api/v1/campaigns/roi retorna 500

**Sintomas:**
```
HTTP 500 Internal Server Error
No campaigns ROI data returned
```

### Diagnóstico

Similar ao Problema #2 - provável erro SQL.

**Passo 1: Verificar query**
```sql
SELECT 
  id, name, budget, revenue_attributed,
  (revenue_attributed::float / budget::float * 100) as roi_percentage
FROM campaigns
WHERE company_id = '24621fc4-8ee7-457f-a142-7c73aa6eeca5'
ORDER BY roi_percentage DESC;
```

**Passo 2: Possível causa**
- Cast de string para float falhando
- Budget = 0 causando divisão por zero
- Type mismatch nas colunas

### Solução Rápida

Editar `CampaignController.js`:

```javascript
async roi(req, res) {
  try {
    const query = `
      SELECT 
        id,
        name,
        budget::float,
        revenue_attributed::float,
        CASE 
          WHEN budget::float > 0 
          THEN ROUND((revenue_attributed::float / budget::float * 100)::numeric, 2)
          ELSE 0
        END as roi_percentage
      FROM campaigns
      WHERE company_id = $1
      ORDER BY roi_percentage DESC
    `;
    
    const result = await pool.query(query, [req.user.companyId]);
    res.json({
      data: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('ROI error:', err);
    res.status(500).json({ error: err.message });
  }
}
```

---

## 🎯 Problema #4: Backend não inicia (Port 3000 em uso)

**Sintomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solução

**Opção 1: Matar processo na porta**
```bash
# Windows (PowerShell Admin)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**Opção 2: Usar porta diferente**
```bash
# Editar package.json
"dev": "PORT=3001 nodemon server.js"

# Ou via env
SET PORT=3001 && node server.js
```

---

## 🎯 Problema #5: JWT Token expirado

**Sintomas:**
```
HTTP 401 Unauthorized
"Token expired"
```

### Solução

**Opção 1: Fazer novo login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meishop.com","password":"admin123"}'
```

**Opção 2: Aumentar tempo de expiração**

Editar `server/controllers/AuthController.js`:

```javascript
// Alterar de 7 dias para 30 dias
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '30d' // Era '7d'
});
```

---

## 🎯 Problema #6: Database connection refused

**Sintomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

### Solução

**Passo 1: Verificar se PostgreSQL está rodando**
```bash
# Windows
Get-Service PostgreSQL

# Mac
brew services list

# Linux
systemctl status postgresql
```

**Passo 2: Iniciar PostgreSQL se não estiver rodando**
```bash
# Windows
net start PostgreSQL

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

**Passo 3: Verificar credenciais em `.env`**
```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/meishop_crm
```

---

## 📋 Checklist de Debug

### Quando algo não funciona, rodar em ordem:

```
1. ✓ Backend está rodando?
   curl http://localhost:3000/api/v1/health

2. ✓ Database está conectado?
   psql -U postgres -d meishop_crm

3. ✓ Seed data foi popula?
   SELECT COUNT(*) FROM campaigns;

4. ✓ Token JWT é válido?
   Fazer novo login

5. ✓ Checar logs do backend
   Procurar por console.log/error

6. ✓ Testar endpoint isolado
   curl + token específico
```

---

## 🛠️ Ferramentas Úteis

### 1. Testar Endpoints
```bash
# Com token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/deals

# POST com dados
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meishop.com","password":"admin123"}'
```

### 2. Verificar Database
```bash
# Conectar
psql -U postgres -d meishop_crm

# Listar tabelas
\dt

# Listar dados específicos
\x (toggle expanded display)
SELECT * FROM campaigns LIMIT 1;
```

### 3. Monitorar Logs
```bash
# Terminal 1: Backend com logs
npm run dev

# Terminal 2: Tail de erros
Get-Content -Path logs.txt -Wait
```

### 4. Testar Completo
```bash
# Executar suite de testes
node test-all.js

# Diagnostic completo
node diagnostic.js
```

---

## 📞 Contato & Escalação

Se problema persistir após estes passos:

1. **Coletar informações:**
   - Output de `npm run dev`
   - Output de `diagnostic.js`
   - Output de `psql -U postgres -d meishop_crm -c "SELECT COUNT(*) FROM deals;"`

2. **Arquivo de relatório:**
   - Salvar em: `TROUBLESHOOTING_LOG.txt`

3. **Compartilhar com dev team**

---

**Última atualização**: 26 de Maio de 2026

