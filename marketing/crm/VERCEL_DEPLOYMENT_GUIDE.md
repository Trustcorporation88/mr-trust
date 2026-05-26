# 🚀 Vercel Deployment Guide - Services Catalog CRM

## Status: Pronto para Deploy

✅ Services Catalog implementado e comitado no GitHub  
✅ `vercel.json` configurado para full-stack  
✅ Estrutura pronta para produção  

---

## 📋 Pré-requisitos

- [ ] Conta Vercel criada (https://vercel.com)
- [ ] Repositório GitHub conectado ao Vercel
- [ ] Variáveis de ambiente PostgreSQL configuradas
- [ ] Vercel CLI instalado (opcional: `npm install -g vercel`)

---

## 🔧 Variáveis de Ambiente Necessárias

Configure estas variáveis **no Painel Vercel** → Projeto → Settings → Environment Variables:

```env
# Banco de dados PostgreSQL (Windows Native)
DATABASE_URL=postgresql://user:password@localhost:5432/mr_holmes_crm
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mr_holmes_crm

# Autenticação JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# API Configuration
API_PORT=3000
NODE_ENV=production

# Frontend Configuration
REACT_APP_API_URL=https://seu-dominio.vercel.app/api/v1
```

---

## 🎯 Opção 1: Deploy Automático (Recomendado)

### Passo 1: Conectar Repositório GitHub ao Vercel

1. Acesse https://vercel.com/new
2. Clique em "Continue with GitHub"
3. Autorize e selecione repositório: `mr-trust`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `marketing/crm`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

### Passo 2: Configurar Variáveis de Ambiente

1. Em "Environment Variables", adicione todas as variáveis da seção anterior
2. Selecione: Production, Preview, Development (conforme necessário)
3. Clique "Deploy"

### Passo 3: Verificar Deploy

- Vercel compilará automaticamente a cada push no GitHub
- URL: `https://mr-trust.vercel.app` (ou seu domínio customizado)

---

## 🚀 Opção 2: Deploy via CLI (Alternativo)

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Autenticar

```bash
vercel login
```

### Passo 3: Deploy

```bash
cd /c/Mr.Holmes/marketing/crm
vercel --prod
```

### Passo 4: Configurar Variáveis

Durante deploy, será solicitado confirmar variáveis de ambiente.

---

## 📊 Configuração do vercel.json

O arquivo `vercel.json` já está configurado com:

### Build
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### Roteamento API → Backend

```json
{
  "routes": [
    {
      "src": "/api/.*",
      "dest": "server/server.js"
    }
  ]
}
```

### Cache Headers

- **API**: `no-cache` (sempre fresco)
- **Static Assets**: `31536000` (1 ano)

---

## ✅ Verificação Pós-Deploy

### 1. Health Check API

```bash
curl https://seu-dominio.vercel.app/api/v1/health
```

Resposta esperada: `{ "status": "ok" }`

### 2. Services Catalog Endpoint

```bash
curl https://seu-dominio.vercel.app/api/v1/services
```

Resposta: Array de 11 serviços com estrutura:
```json
{
  "total": 11,
  "services": [
    {
      "id": "create_deal",
      "name": "Criar Oportunidade",
      "category": "vendas",
      ...
    }
  ],
  "categories": ["vendas", "suporte", "marketing", "dados", "configuração", "integrações"]
}
```

### 3. Frontend Services Catalog

Navegue para: `https://seu-dominio.vercel.app/services`

Esperado:
- ✅ Grid de 11 cards com serviços
- ✅ Filtro por categoria funcionando
- ✅ Modal abrindo ao clicar em serviço
- ✅ Instruções e dados visíveis

---

## 🔒 Segurança em Produção

### ⚠️ Não expor dados sensíveis

1. ❌ NUNCA commitar `.env` com valores reais
2. ✅ Usar apenas variáveis Vercel Environment
3. ✅ Rotacionar `JWT_SECRET` regularmente
4. ✅ Habilitar HTTPS (automático)

### 🛡️ Headers de Segurança (já configurados)

```json
{
  "key": "Cache-Control",
  "value": "no-cache, no-store, must-revalidate"
}
```

---

## 🔄 Processo de Deploy Contínuo

**Cada push no GitHub dispara automaticamente:**

1. ✅ Build frontend (React)
2. ✅ Validação de código
3. ✅ Compressão de assets
4. ✅ Deploy em CDN global
5. ✅ SSL/TLS automático
6. ✅ URL preview para PRs

---

## 📈 Monitoramento e Logs

### Ver Logs em Tempo Real

```bash
vercel logs [seu-projeto]
```

### Acessar Painel Vercel

https://vercel.com/dashboard

---

## 🆘 Troubleshooting

### ❌ "Cannot find module 'express'"

**Solução**: Variáveis de ambiente não configuradas
```bash
# Localmente
npm install -g vercel
vercel env pull
npm install
```

### ❌ "API endpoint retorna 404"

**Solução**: Verificar `vercel.json` routes estão corretas
```bash
# Revalidar
cat vercel.json | grep routes
```

### ❌ "Build falha no frontend"

**Solução**: Erro em dependências React
```bash
# Limpar cache
vercel env pull
cd frontend
npm cache clean --force
npm install
npm run build
```

---

## 📞 Próximas Etapas

1. **Conectar domínio customizado** (opcional)
   - Painel Vercel → Domains → Adicionar domínio

2. **Configurar monitoria** 
   - Integrar com Sentry, DataDog, ou NewRelic

3. **Backup de dados**
   - PostgreSQL em produção deve estar em nuvem (AWS RDS, Azure Database)

4. **CI/CD avançado**
   - Adicionar testes automáticos antes de deploy
   - Implementar canary deployments

---

## 🎉 Sucesso!

Sua aplicação Services Catalog estará em produção em:

**`https://seu-dominio.vercel.app`** 

Com:
- ✅ 11 serviços com instruções
- ✅ API RESTful completa
- ✅ React UI responsiva
- ✅ Auto-scaling global
- ✅ CDN em +200 países

---

**DevOps Automation Status**: ✅ PRONTO PARA PRODUÇÃO
