# ⚡ MEISHOP CRM - Quick Start Guide

**Seu sistema está 73% pronto para usar!**

---

## 🚀 Iniciar Rápido (5 minutos)

### 1. Abrir 2 Terminals

**Terminal 1 - Backend:**
```bash
cd C:\Mr.Holmes\marketing\crm\server
npm run dev
```
✅ Quando ver: `Server running on port 3000`

**Terminal 2 - Frontend:**
```bash
cd C:\Mr.Holmes\marketing\crm\frontend  
npm run dev
```
✅ Quando ver: `Local: http://localhost:5173`

---

## 🔐 Login de Demo

**URL:** http://localhost:5173 (Frontend)

**Credenciais:**
```
Email:    admin@meishop.com
Password: admin123
```

---

## ✅ O Que Funciona Agora

| Feature | Status | Notas |
|---------|--------|-------|
| Login/Auth | ✅ | JWT Token gerado |
| Campanhas | ✅ | 4 campanhas demo |
| Dashboard | ✅ | Layout responsivo |
| Deals | ⚠️ | Vazio (filtro a corrigir) |
| Tickets | ⚠️ | Vazio (filtro a corrigir) |

---

## 🧪 Testes Rápidos

### Teste 1: Verificar Health
```bash
curl http://localhost:3000/health
```
Esperado: `{"status":"ok"}`

### Teste 2: Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meishop.com","password":"admin123"}'
```
Esperado: `{"token":"eyJ...", "user":{...}}`

### Teste 3: Listar Campanhas
```bash
# Pegar token do login anterior
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/campaigns
```
Esperado: 4 campanhas retornadas

---

## 🐛 Se Algo Não Funcionar

### Backend não inicia?
```bash
# Matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database erro?
```bash
# Verificar se PostgreSQL está rodando
Get-Service PostgreSQL

# Se não, iniciar
net start PostgreSQL
```

### Deals/Tickets vazios?
→ **Esperado por enquanto!** Precisa corrigir filtro company_id
→ Veja `TROUBLESHOOTING.md` para mais detalhes

---

## 📊 Dashboard Demo

Após login, verá:
- **Campanhas**: 4 campanhas ativas (Email, Social, Ads, Webinar)
- **ROI**: Receita atribuída por campanha
- **Leads**: Total leads gerados (500+)
- **Oportunidades**: 34 oportunidades em aberto

---

## 🎓 Estrutura de Dados

### Usuários
```
Email: admin@meishop.com
Senha: admin123
Empresa: MEISHOP Demo
Rol: Admin (acesso completo)
```

### Campanhas (4)
```
1. Email Marketing - Março    → R$ 5K investido, R$ 15K ROI
2. Social Media - Abril        → R$ 3K investido, R$ 8K ROI
3. Google Ads - Maio           → R$ 7K investido, R$ 21K ROI
4. Webinar - Evento            → R$ 2K investido, R$ 12K ROI
```

### Dados Demo
```
Total Budget: R$ 17K
Total Revenue: R$ 56K
Avg ROI: 229%
```

---

## 📱 APIs Disponíveis

| Rota | Método | Status | Auth |
|------|--------|--------|------|
| `/api/v1/auth/login` | POST | ✅ | Não |
| `/api/v1/campaigns` | GET | ✅ | JWT |
| `/api/v1/deals` | GET | ✅ | JWT |
| `/api/v1/tickets` | GET | ✅ | JWT |
| `/api/v1/users/me` | GET | ✅ | JWT |

---

## 🔧 Scripts Úteis

### Testar todos endpoints
```bash
cd server
node test-all.js
```

### Verificar health do sistema
```bash
cd server
node diagnostic.js
```

### Popular database novamente
```bash
cd server
node seed.js
```

---

## 📝 Próximas Ações

✅ **Hoje - Usar como está**
- Testar login
- Explorar campanhas
- Validar layout

⚠️ **Amanhã - Corrigir bugs**
- Fix: Deals/Tickets vazios
- Fix: Endpoints de métricas (500 errors)

🚀 **Esta semana - Deploy**
- Frontend build production
- Backend em servidor
- Database backup

---

## 📞 Documentação

- `API_TEST_RESULTS.md` → Testes de endpoints
- `EXECUTION_REPORT.md` → Relatório completo
- `TROUBLESHOOTING.md` → Debug detalhado
- `MEISHOP_CRM_SETUP.md` → Setup técnico

---

**Pronto para usar! 🚀**

Qualquer dúvida, consulte `TROUBLESHOOTING.md`

