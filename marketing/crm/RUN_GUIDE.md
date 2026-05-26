# MEISHOP CRM - Guia Completo de Execução

## 🚀 Quick Start (5 minutos)

### Pré-requisitos
- Node.js 16+ e npm 8+
- PostgreSQL 14+
- Git

### 1️⃣ Clonar/Preparar Projeto
```bash
cd c:\Mr.Holmes\marketing\crm
# Ou seu path do projeto
```

### 2️⃣ Setup Backend
```bash
cd server
npm install

# Criar arquivo .env com:
cp .env.example .env

# Editar .env com suas credenciais:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meishop
DB_USER=postgres
DB_PASSWORD=sua_senha
PORT=3000
JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=7d
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Setup Database
```bash
# Criar banco (se não existe)
createdb -U postgres meishop

# Executar schema
psql -U postgres -d meishop -f ../database.sql

# Output esperado: 8 tabelas criadas, 6 triggers, 2 functions
```

### 4️⃣ Iniciar Backend
```bash
# Ainda em /server
npm run dev

# Output esperado:
# ✓ Database connected successfully
# ✓ Server running on http://localhost:3000
# ✓ Health check available at /health
```

### 5️⃣ Setup Frontend (nova aba terminal)
```bash
cd frontend
npm install

# Criar .env:
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
```

### 6️⃣ Iniciar Frontend
```bash
npm run dev

# Output esperado:
# ✓ Local: http://localhost:5173
# ✓ Browser abre automaticamente
```

### 7️⃣ Login
```
Email: admin@meishop.com
Password: admin123
```

---

## 📍 Estrutura do Projeto

```
c:\Mr.Holmes\marketing\crm\
├── server/                          # Backend Node.js + Express
│   ├── controllers/
│   │   ├── AuthController.js       # Login, register, token refresh
│   │   ├── CustomerController.js   # CRUD clientes
│   │   ├── DealController.js       # Kanban, pipeline (NEW)
│   │   ├── TicketController.js     # SLA tracking (NEW)
│   │   └── CampaignController.js   # ROI analytics (NEW)
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── customers.js            # Customer endpoints
│   │   ├── deals.js                # Deal endpoints (NEW - Wired)
│   │   ├── tickets.js              # Ticket endpoints (NEW - Wired)
│   │   └── campaigns.js            # Campaign endpoints (NEW - Wired)
│   ├── middleware/
│   │   └── auth.js                 # JWT verification
│   ├── config/
│   │   └── database.js             # PostgreSQL pool
│   ├── .env.example                # Template variáveis
│   ├── server.js                   # Express app entry
│   └── package.json
│
├── frontend/                        # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Auth page
│   │   │   ├── Dashboard.jsx       # Home com KPIs
│   │   │   ├── Customers.jsx       # Customers list
│   │   │   ├── CustomerDetail.jsx  # Customer 360
│   │   │   ├── DealsKanban.jsx     # Kanban board (NEW)
│   │   │   ├── Tickets.jsx         # Tickets + SLA (NEW)
│   │   │   └── Campaigns.jsx       # Campaigns + ROI (NEW)
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Nav sidebar (UPDATED)
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Auth store (Zustand)
│   │   ├── api/
│   │   │   └── client.js           # Axios client
│   │   ├── App.jsx                 # Router setup (UPDATED)
│   │   └── index.css               # Global styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database.sql                     # PostgreSQL schema
├── .env.example                     # Backend config template
├── SETUP_GUIDE.md                   # Detailed setup guide
├── IMPLEMENTATION_SUMMARY.md        # Project overview
└── IMPLEMENTATION_OPTION_B.md       # This file + feature details
```

---

## 🔗 API Endpoints by Feature

### Authentication (Existing)
```
POST   /api/v1/auth/register        # Create account
POST   /api/v1/auth/login           # Get JWT token
POST   /api/v1/auth/refresh-token   # Extend session
```

### Customers (Existing)
```
GET    /api/v1/customers            # List with search
GET    /api/v1/customers/:id        # Customer 360
POST   /api/v1/customers            # Create
PATCH  /api/v1/customers/:id        # Update
DELETE /api/v1/customers/:id        # Soft delete
```

### Deals (NEW)
```
GET    /api/v1/deals                # List with filters
GET    /api/v1/deals/grouped/stage  # Pipeline summary
GET    /api/v1/deals/:id            # Detail
POST   /api/v1/deals                # Create
PATCH  /api/v1/deals/:id            # Update
POST   /api/v1/deals/:id/stage      # Change stage
POST   /api/v1/deals/:id/won        # Mark as won (+10 health)
POST   /api/v1/deals/:id/lost       # Mark as lost (-15 health)
DELETE /api/v1/deals/:id            # Delete
```

### Tickets (NEW)
```
GET    /api/v1/tickets              # List with SLA status
GET    /api/v1/tickets/metrics/all  # Dashboard metrics
GET    /api/v1/tickets/:id          # Detail
POST   /api/v1/tickets              # Create (auto SLA)
PATCH  /api/v1/tickets/:id          # Update
POST   /api/v1/tickets/:id/resolve  # Mark resolved
POST   /api/v1/tickets/:id/csat     # Submit CSAT (1-5)
DELETE /api/v1/tickets/:id          # Delete
```

### Campaigns (NEW)
```
GET    /api/v1/campaigns            # List with ROI
GET    /api/v1/campaigns/roi/all    # Compare all
GET    /api/v1/campaigns/:id        # Detail
GET    /api/v1/campaigns/:id/roi    # ROI analysis
POST   /api/v1/campaigns            # Create
PATCH  /api/v1/campaigns/:id        # Update
DELETE /api/v1/campaigns/:id        # Delete
```

---

## 🧪 Test Examples

### Create a Deal
```bash
curl -X POST http://localhost:3000/api/v1/deals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enterprise Package",
    "customer_id": "customer-uuid",
    "amount": 50000,
    "stage": "Prospecção",
    "expected_close_date": "2024-02-28",
    "description": "Big deal"
  }'
```

### Get Deals by Stage
```bash
curl http://localhost:3000/api/v1/deals/grouped/stage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Ticket
```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login not working",
    "customer_id": "customer-uuid",
    "priority": "high",
    "description": "Cannot access system"
  }'
# SLA deadline created automatically: NOW() + 4 hours
```

### Get Ticket Metrics
```bash
curl http://localhost:3000/api/v1/tickets/metrics/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Campaign
```bash
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Black Friday 2024",
    "type": "email",
    "budget": 10000,
    "channel": "newsletter",
    "description": "Email blast promotion"
  }'
```

### Get All ROI Analysis
```bash
curl http://localhost:3000/api/v1/campaigns/roi/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎨 Frontend Navigation

After login, sidebar shows:
```
📊 Dashboard        → /              (KPIs + charts)
👥 Clientes         → /customers     (List + search)
📈 Pipeline (Kanban)→ /deals         (Drag-drop stages)
🎫 Tickets          → /tickets       (SLA tracking)
📢 Campanhas        → /campaigns     (ROI analytics)
```

Active page highlighted in blue.

---

## 🔐 Authentication Flow

1. User enters email + password on Login page
2. Frontend POST to `/api/v1/auth/login`
3. Backend returns JWT token
4. Frontend stores token in `localStorage['authToken']`
5. Axios interceptor adds token to all requests: `Authorization: Bearer token`
6. If 401 response: Token removed, redirect to /login

### Test Token:
```bash
# Decode JWT (visit jwt.io)
# Payload contains: user_id, company_id, role, fullName, email
```

---

## 🛠️ Environment Variables

### Backend (.env)
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meishop
DB_USER=postgres
DB_PASSWORD=password

# Server
PORT=3000

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Email (Optional - for future integrations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# Mailchimp (Optional)
MAILCHIMP_API_KEY=your-api-key-us15
MAILCHIMP_SERVER=us15
MAILCHIMP_AUDIENCE_ID=audience-id
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📊 Database Schema Overview

### Table: deals
```
id, company_id, customer_id, title, amount, stage, status,
expected_close_date, owner_id, description, probability,
created_at, updated_at
```

### Table: tickets
```
id, company_id, customer_id, title, priority, status,
description, assigned_to, sla_deadline, csat_rating,
csat_comments, created_at, updated_at
```

### Table: campaigns
```
id, company_id, name, type, description, start_date,
end_date, budget, channel, status, revenue, created_at,
updated_at
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Port 3000 already in use"
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port: PORT=3001 npm run dev
```

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
# Windows: Check Services for "PostgreSQL"
# Or: psql -U postgres (should connect)

# If DB not created:
createdb -U postgres meishop

# If tables missing:
psql -U postgres -d meishop < database.sql
```

### Issue: "401 Unauthorized" on API calls
```bash
# Check token in localStorage
# Browser DevTools → Application → localStorage → authToken
# Token might be expired, login again
```

### Issue: SLA calculated wrong
```bash
# Check server timezone: SELECT NOW();
# SLA uses database NOW() function
# Adjust if server in different timezone
```

### Issue: ROI shows 0%
```bash
# ROI depends on revenue field
# Make sure campaign.revenue is updated
# Or deals with status='Fechado' are linked to campaign_id
```

---

## 🧹 Maintenance Tasks

### Daily
- Monitor `/api/v1/health` endpoint
- Check for overdue tickets (sla_is_overdue = true)
- Review error logs in server console

### Weekly
- Review SLA compliance rate
- Analyze campaign ROI trends
- Check for stale deals (no updates > 30 days)

### Monthly
- Archive closed deals
- Export ticket metrics
- Review customer health scores

---

## 📱 Frontend Libraries Used

- **React 18.2.0** - UI library
- **React Router 6.11.0** - Client-side routing
- **Vite 4.3.9** - Build tool
- **TailwindCSS 3.3.2** - Styling
- **Zustand 4.3.8** - State management
- **Axios 1.4.0** - HTTP client

---

## 🔄 Build & Deploy

### Production Build
```bash
# Backend
cd server
npm run build

# Frontend
cd frontend
npm run build
# Creates: frontend/dist/ folder for hosting
```

### Deployment Steps
1. Set production `JWT_SECRET` in `.env`
2. Use production database URL
3. Build frontend: `npm run build`
4. Upload `frontend/dist/` to CDN or server
5. Deploy backend to server/cloud platform
6. Configure CORS for frontend URL
7. Update `FRONTEND_URL` in backend `.env`

---

## ✅ Success Indicators

After setup, you should see:

✅ **Backend**
- Server logs: "Database connected successfully"
- Health endpoint returns: `{"status":"ok"}`

✅ **Frontend**
- Login page loads at http://localhost:5173
- Login with admin@meishop.com / admin123
- Dashboard shows customer count

✅ **Deals**
- Kanban board loads with empty stages
- Can create deal via POST
- Can drag deal between stages

✅ **Tickets**
- Tickets page shows 0 open tickets
- Can create ticket (SLA deadline auto-set)
- Metrics show sla_compliance_rate

✅ **Campaigns**
- Campaigns page loads empty
- Can create campaign
- ROI calculates correctly (depends on revenue)

---

## 📞 Support Commands

```bash
# Check backend is running
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meishop.com","password":"admin123"}'

# List all database tables
psql -U postgres -d meishop -c "\dt"

# Reset database (WARNING: Deletes all data)
psql -U postgres -d meishop -f database.sql
```

---

**Setup Complete!** 🎉

For detailed troubleshooting, see SETUP_GUIDE.md
For feature documentation, see IMPLEMENTATION_OPTION_B.md
