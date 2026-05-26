# MEISHOP CRM - Especificação Técnica

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Vue)                    │
│  Dashboard | Clientes | Pipeline | Tickets | Campanhas      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API REST (Node/Python)                  │
│  Auth | Customers | Deals | Tickets | Campaigns | Reports   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  Customers | Deals | Tickets | Campaigns | Users | Logs    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ SCHEMA DO BANCO DE DADOS

### **Tabela: users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'manager_sales', 'rep', 'support', 'marketing'),
    company_id UUID NOT NULL REFERENCES companies(id),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

---

### **Tabela: companies**
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    website VARCHAR(255),
    industry VARCHAR(100),
    size ENUM('startup', 'pme', 'medium', 'large'),
    subscription_plan ENUM('starter_299', 'recommended_899', 'enterprise'),
    subscription_start DATE,
    subscription_end DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

---

### **Tabela: customers**
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(14),
    
    -- Segmentação
    segment VARCHAR(100),
    industry VARCHAR(100),
    location VARCHAR(255),
    country VARCHAR(2) DEFAULT 'BR',
    
    -- Relacionamento
    owner_id UUID REFERENCES users(id),
    account_manager_id UUID REFERENCES users(id),
    
    -- Métricas
    health_score INT DEFAULT 50,  -- 0-100
    csat INT,                      -- 1-5
    lifetime_value DECIMAL(15,2),
    
    -- Historico
    date_entered TIMESTAMP DEFAULT now(),
    last_interaction TIMESTAMP,
    
    -- Tags e categorias
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    
    -- Controle
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_owner ON customers(owner_id);
```

---

### **Tabela: deals**
```sql
CREATE TABLE deals (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Básico
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pipeline
    stage VARCHAR(100) NOT NULL,  -- prospecção, qualificação, proposta, negociação, fechado
    probability INT DEFAULT 50,    -- 0-100 (%)
    
    -- Financeiro
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Datas
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Atribuição
    owner_id UUID NOT NULL REFERENCES users(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Origem
    source VARCHAR(100),  -- cold_call, inbound, referral, etc
    campaign_id UUID REFERENCES campaigns(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'open',  -- open, won, lost
    loss_reason VARCHAR(255),
    
    -- Documentos
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage);
```

---

### **Tabela: tickets**
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Básico
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Categorização
    category VARCHAR(100),  -- dúvida, problema, requisição, feedback
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Status
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    
    -- Atribuição
    assigned_to_id UUID REFERENCES users(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    
    -- SLA
    sla_hours INT,  -- tempo máximo para resolver (em horas)
    due_date TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Satisfação
    csat_rating INT,  -- 1-5
    csat_comment TEXT,
    
    -- Historico
    internal_notes TEXT,
    
    -- Multicanal
    channel VARCHAR(50),  -- email, whatsapp, form, phone
    channel_message_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON tickets(status);
```

---

### **Tabela: campaigns**
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- Básico
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Tipo e canal
    type VARCHAR(100),  -- email, linkedin, google_ads, referral, direct
    channel VARCHAR(50) NOT NULL,
    
    -- Datas
    start_date DATE,
    end_date DATE,
    
    -- Orçamento
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Status
    status VARCHAR(50),  -- planned, active, paused, completed
    
    -- Criação
    created_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Métricas
    leads_generated INT DEFAULT 0,
    leads_qualified INT DEFAULT 0,
    opportunities_created INT DEFAULT 0,
    customers_acquired INT DEFAULT 0,
    revenue_attributed DECIMAL(15,2),
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_campaigns_company ON campaigns(company_id);
```

---

### **Tabela: interactions**
```sql
CREATE TABLE interactions (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Tipo
    type VARCHAR(50),  -- email, call, meeting, message, note
    
    -- Conteúdo
    subject VARCHAR(255),
    content TEXT,
    
    -- Participantes
    initiated_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Relacionamentos
    deal_id UUID REFERENCES deals(id),
    ticket_id UUID REFERENCES tickets(id),
    
    -- Metadados
    duration_minutes INT,
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_interactions_company ON interactions(company_id);
CREATE INDEX idx_interactions_customer ON interactions(customer_id);
```

---

### **Tabela: audit_logs**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- O que foi feito
    action VARCHAR(100),  -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(50),  -- customer, deal, ticket
    entity_id UUID,
    
    -- Quem fez
    user_id UUID REFERENCES users(id),
    
    -- O que mudou
    old_values JSONB,
    new_values JSONB,
    
    -- IP e user agent
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

---

## 🔌 API REST (Endpoints)

### **BASE URL:** `https://api.meishop.com.br/v1`

---

### **Authentication**
```
POST /auth/login
Body: { email, password }
Response: { access_token, refresh_token, user }

POST /auth/refresh
Body: { refresh_token }
Response: { access_token }

POST /auth/logout
Response: { success: true }
```

---

### **Customers (Clientes)**
```
GET /customers
  Query: page=1, limit=20, search="João", segment="PME"
  Response: { data: [...], total, page, pages }

GET /customers/:id
  Response: { id, name, email, phone, deals, tickets, interactions }

POST /customers
  Body: { name, email, phone, segment, owner_id }
  Response: { id, ... }

PATCH /customers/:id
  Body: { name, email, health_score, tags }
  Response: { id, ... }

DELETE /customers/:id
  Response: { success: true }

GET /customers/:id/interactions
  Response: { data: [email, call, meeting...] }

GET /customers/:id/deals
  Response: { data: [{id, title, amount, stage}...] }

GET /customers/:id/tickets
  Response: { data: [{id, title, priority, status}...] }
```

---

### **Deals (Oportunidades)**
```
GET /deals
  Query: page=1, stage="prospecção", owner_id=..., sort=expected_close_date
  Response: { data: [...], total, total_pipeline_value }

GET /deals/:id
  Response: { id, title, customer, amount, stage, probability, owner, interactions }

POST /deals
  Body: { title, customer_id, amount, stage, owner_id, expected_close_date }
  Response: { id, ... }

PATCH /deals/:id
  Body: { stage, probability, amount, owner_id }
  Response: { id, updated_at }

PUT /deals/:id/stage
  Body: { new_stage }
  Response: { id, stage, updated_at }

DELETE /deals/:id
  Response: { success: true }

POST /deals/:id/won
  Body: { notes }
  Response: { status: "won" }

POST /deals/:id/lost
  Body: { loss_reason }
  Response: { status: "lost" }

GET /deals/dashboard/summary
  Response: { total_value, by_stage: {...}, forecast, won_this_month }
```

---

### **Tickets (Atendimento)**
```
GET /tickets
  Query: page=1, status="open", priority="high", assigned_to=...
  Response: { data: [...], total, sla_breach_count }

GET /tickets/:id
  Response: { id, title, customer, status, priority, assigned_to, interactions, sla_info }

POST /tickets
  Body: { title, description, customer_id, category, priority, channel }
  Response: { id, ... }

PATCH /tickets/:id
  Body: { status, priority, assigned_to_id, internal_notes }
  Response: { id, ... }

POST /tickets/:id/resolve
  Body: { resolution_notes }
  Response: { status: "resolved", resolved_at }

POST /tickets/:id/close
  Response: { status: "closed" }

POST /tickets/:id/csat
  Body: { rating: 1-5, comment: "..." }
  Response: { success: true }

GET /tickets/dashboard/metrics
  Response: { total_open, avg_resolution_time, csat_avg, sla_compliance }
```

---

### **Campaigns (Campanhas)**
```
GET /campaigns
  Query: page=1, channel="email", status="active"
  Response: { data: [...], total }

GET /campaigns/:id
  Response: { id, name, channel, leads_generated, roi, status }

POST /campaigns
  Body: { name, type, channel, budget, start_date, end_date }
  Response: { id, ... }

PATCH /campaigns/:id
  Body: { status, leads_generated, leads_qualified, revenue_attributed }
  Response: { id, ... }

POST /campaigns/:id/leads
  Body: { customer_id, lead_source }
  Response: { success: true }

GET /campaigns/dashboard/roi
  Response: { campaigns: [{name, budget, revenue, roi_percentage}...] }
```

---

### **Reports & Analytics**
```
GET /reports/dashboard
  Response: {
    customers: { total, new_this_month },
    deals: { total_value, pipeline, forecast },
    tickets: { total_open, csat_avg, resolution_time },
    campaigns: { leads, conversions, roi }
  }

GET /reports/sales-forecast
  Query: months=3
  Response: { months: [{month, forecast_value, probability_weighted}...] }

GET /reports/customer-health
  Response: { customers: [{id, name, health_score, risk_level}...] }

GET /reports/team-performance
  Query: department="sales"
  Response: { users: [{name, deals_open, deals_won, avg_deal_size}...] }

GET /reports/audit-log
  Query: entity_type="deal", days=30
  Response: { logs: [{action, entity, user, timestamp}...] }
```

---

### **Integrations (Webhooks & External)**
```
POST /integrations/whatsapp/webhook
  Body: { message_id, customer_phone, text, timestamp }
  Response: { ticket_id }

POST /integrations/email/webhook
  Body: { from, to, subject, body, timestamp }
  Response: { ticket_id }

POST /integrations/mailchimp/subscribe
  Body: { email, name, segment }
  Response: { success: true }

GET /integrations/webhooks
  Response: { data: [{id, event, url, is_active}...] }
```

---

## 🎨 Frontend - Telas Principais

### **1. Dashboard**
```
┌─────────────────────────────────────────────────┐
│ MEISHOP CRM - Dashboard                    👤   │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 PIPELINE          💰 FORECAST        📱 SLA │
│  R$ 450.5K            R$ 220K/mês       92%    │
│                                                 │
│  ┌────────────────┬────────────────────────┐  │
│  │ ESTÁGIO        │ QUANTIDADE | VALOR     │  │
│  ├────────────────┼────────────────────────┤  │
│  │ Prospecção     │ 12 deals   | 150K      │  │
│  │ Qualificação   │ 8 deals    | 200K      │  │
│  │ Proposta       │ 5 deals    | 100.5K    │  │
│  │ Negociação     │ 2 deals    | 50K       │  │
│  └────────────────┴────────────────────────┘  │
│                                                 │
│  ✅ TICKETS HOJE      📧 ÚLTIMAS INTERAÇÕES   │
│  4 ABERTOS / 1 SLA    • João Silva: Deal...   │
│                       • Maria: Ticket resolvido
│                                                 │
└─────────────────────────────────────────────────┘
```

### **2. Clientes - Listagem**
```
┌─────────────────────────────────────────────────┐
│ CLIENTES                          🔍 Buscar     │
├──────┬─────────────┬──────────┬────────┬────────┤
│ NOME │ EMAIL       │ TELEFONE │ HEALTH │ OWNER  │
├──────┼─────────────┼──────────┼────────┼────────┤
│ João │ j@abc.com.b │ 11999991 │ 85%    │ Carlos │
│ Maria│ m@xyz.com.b │ 11888889 │ 72%    │ Ana    │
│      │             │          │        │        │
└──────┴─────────────┴──────────┴────────┴────────┘
```

### **3. Cliente - Detalhe (Customer 360)**
```
┌──────────────────────────────────────────────────┐
│ João Silva - ABC Serviços                       │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📧 joao@abc.com.br  |  📱 11 99999-1111        │
│ 🏢 ABC Serviços     |  📍 São Paulo, SP        │
│ 🏭 Segmento: Varejo |  🎯 Health Score: 85%   │
│                                                  │
│ ÚLTIMAS INTERAÇÕES:                             │
│ • 25/05 - Chamada com Carlos (30 min)          │
│ • 24/05 - Email: Proposta enviada              │
│ • 23/05 - Reunião: Apresentação de features    │
│                                                  │
│ OPORTUNIDADES ABERTAS:                          │
│ • Deal: Contrato anual - R$ 50K (Proposta)    │
│ • Deal: Upgrade plano - R$ 5K (Qualificação)  │
│                                                  │
│ TICKETS ABERTOS:                                │
│ • Dúvida sobre integração WhatsApp (Média)    │
│                                                  │
│ ┌─── [EDITAR] [ADICIONAR INTERAÇÃO] [+] ────┐ │
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### **4. Pipeline - Kanban**
```
┌──────────────────────────────────────────────────┐
│ PIPELINE - Kanban View                           │
├──────────┬──────────┬──────────┬──────────┬──────┤
│PROSPEÇÃO │QUALIFI.  │PROPOSTA  │NEGOCIA.  │FECHADO
├──────────┼──────────┼──────────┼──────────┼──────┤
│ Deal 1   │ Deal 5   │ Deal 8   │ Deal 10  │Deal12│
│ R$20K    │ R$25K    │ R$45K    │ R$50K    │R$80K │
│ ABC Ltd  │ XYZ Inc  │ 123 Elet │ Fast Svc │ABC..│
│          │          │          │          │      │
│ Deal 2   │ Deal 6   │ Deal 9   │ Deal 11  │      │
│ R$30K    │ R$35K    │ R$55K    │ R$40K    │      │
│ 456 Corp │ Fast Svc │ Tech Co  │ Smart Co │      │
│          │          │          │          │      │
│ [+ ADD]  │ [+ ADD]  │ [+ ADD]  │ [+ ADD]  │[+ADD]│
└──────────┴──────────┴──────────┴──────────┴──────┘
```

### **5. Tickets - Fila**
```
┌────────────────────────────────────────────────┐
│ TICKETS - Fila de Atendimento                  │
├────────┬─────────┬─────────┬──────┬──────┬─────┤
│TÍTULO  │PRIORIDA │STATUS   │CLIENTE│ASSIG│PRAZO│
├────────┼─────────┼─────────┼──────┼──────┼─────┤
│Bug: En │URGENT   │OPEN     │ABC   │Carlos│2h   │
│WhatsApp│HIGH     │IN_PROG  │XYZ   │Ana   │4h   │
│Dúvida: │MEDIUM   │OPEN     │123   │-     │8h   │
└────────┴─────────┴─────────┴──────┴──────┴─────┘
```

---

## 🚀 Stack Recomendado

**Backend:** Node.js + Express (ou Python + FastAPI)
**Banco:** PostgreSQL
**Frontend:** React + TypeScript + TailwindCSS
**Auth:** JWT + OAuth2
**Real-time:** WebSockets (Socket.io)
**Hosting:** AWS / DigitalOcean / Heroku
**CI/CD:** GitHub Actions

---

## 📋 Fases de Implementação

### **Fase 1: MVP (Semana 1-2)**
- [ ] Setup banco de dados (schema básico)
- [ ] Auth (login/logout)
- [ ] CRUD Customers + Dashboard
- [ ] CRUD Deals + Pipeline básico

### **Fase 2: Core Features (Semana 3-4)**
- [ ] Tickets + SLA
- [ ] Campaigns tracking
- [ ] Interactions log
- [ ] Relatórios básicos

### **Fase 3: Integrações (Semana 5)**
- [ ] WhatsApp webhook
- [ ] Email webhook
- [ ] Mailchimp integration
- [ ] Google Ads pixel

### **Fase 4: Polish (Semana 6)**
- [ ] Audit logs
- [ ] Notifications
- [ ] Export/Import
- [ ] Performance optimization

---

## ✅ Quer começar com qual parte?

**A)** Criar banco de dados (PostgreSQL schema)
**B)** Implementar APIs (Node.js/FastAPI)
**C)** Desenvolver Frontend (React dashboard)
**D)** Integração com Mailchimp/WhatsApp
