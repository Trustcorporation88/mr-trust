# MEISHOP CRM - Full-Stack Implementation Guide

## 📋 Project Structure

```
MEISHOP CRM/
├── server/                    # Node.js/Express backend
│   ├── config/
│   │   └── database.js        # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT authentication & authorization
│   ├── controllers/
│   │   ├── AuthController.js  # Login, register, token refresh
│   │   └── CustomerController.js  # CRUD customers + interactions
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── deals.js           # Stub
│   │   ├── tickets.js         # Stub
│   │   └── campaigns.js       # Stub
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── .env.example
│   └── .env                   # (Create from .env.example)
│
├── frontend/                  # React/Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx     # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Customers.jsx  # Customers list
│   │   │   ├── CustomerDetail.jsx  # Customer 360 view
│   │   │   └── Login.jsx      # Authentication
│   │   ├── api/
│   │   │   └── client.js      # Axios instance + interceptors
│   │   ├── hooks/
│   │   │   └── useAuth.js     # Zustand auth store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env                   # (Create from .env.example)
│
├── database.sql               # PostgreSQL schema
├── mailchimp_automation.py    # Email automation setup
├── CRM-TECHNICAL-SPEC.md      # Full technical documentation
└── EMAIL-SEQUENCE.md          # Email templates

```

---

## 🚀 Quick Start Guide

### Phase 1: Database Setup

```bash
# 1. Create PostgreSQL database
createdb meishop_crm

# 2. Execute database schema
psql meishop_crm < database.sql

# 3. Verify tables
psql meishop_crm -c "\dt"
```

### Phase 2: Backend Setup

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your values:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=meishop_crm
# DB_USER=postgres
# DB_PASSWORD=your_password
# PORT=3000
# JWT_SECRET=your-super-secret-key-change-in-production
# FRONTEND_URL=http://localhost:3000

# 4. Start server
npm run dev
# Server should log: ✅ Server running at http://localhost:3000
# ✅ Connected to PostgreSQL
```

**Test health endpoint:**
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","database":"connected"}
```

### Phase 3: Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with backend URL:
# VITE_API_URL=http://localhost:3000/api/v1

# 4. Start development server
npm run dev
# Opens browser at http://localhost:5173
```

**Test login:**
- Email: `test@meishop.com.br` (or any email)
- Password: `123456`
- Note: Using dummy auth for MVP - implement real login against DB

---

## 🔐 Authentication Flow

### Current Implementation (Demo)
```javascript
// Login endpoint accepts ANY email/password
POST /api/v1/auth/login
{
  "email": "user@meishop.com.br",
  "password": "any_password"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@meishop.com.br",
    "fullName": "User Name",
    "role": "sales_rep"
  },
  "token": "jwt_token"
}
```

### JWT Token
- Stored in `localStorage` as `authToken`
- Automatically added to all API requests via Axios interceptor
- Expires in 7 days (configurable via `JWT_EXPIRE` env var)
- Auto-logout if token invalid (401 response)

### To Use Real Database Authentication

Update `AuthController.js` `login()` function to query actual users table instead of accepting any credentials:

```javascript
// Instead of:
if (!validPassword) return res.status(401)...

// Add real database query:
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)
```

---

## 🗂️ Database Schema Summary

### 8 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `companies` | Account management | id, name, email, subscription_tier |
| `users` | Team members | id, company_id, email, password_hash, role |
| `customers` | Client records | id, company_id, name, email, health_score, segment |
| `deals` | Sales opportunities | id, customer_id, title, amount, stage, expected_close_date |
| `tickets` | Support queue | id, customer_id, title, priority, status, sla_deadline |
| `campaigns` | Marketing campaigns | id, company_id, name, type, status, roi |
| `interactions` | Communication log | id, customer_id, type (email/call/meeting/note), notes |
| `audit_logs` | Compliance & audit | id, table_name, operation, user_id, changes |

### Relationships

```
companies (1) ──── (many) users
companies (1) ──── (many) customers
companies (1) ──── (many) deals
companies (1) ──── (many) campaigns
customers (1) ──── (many) deals
customers (1) ──── (many) tickets
customers (1) ──── (many) interactions
users (1) ──── (many) deals (as owner)
users (1) ──── (many) customers (as owner)
users (1) ──── (many) tickets (as assigned_to)
```

---

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)

```
POST /register
  Request: { email, password, fullName, companyId }
  Response: { message, user, token }

POST /login
  Request: { email, password }
  Response: { message, user, token }

POST /refresh
  Request: { token }
  Response: { token }
```

### Customers (`/api/v1/customers`)

```
GET /
  Query: ?page=1&limit=20&search=...&segment=...&owner_id=...
  Response: { data: [...], total, page, pages, limit }

GET /:id
  Response: { customer, interactions: [...], deals: [...], tickets: [...] }

POST /
  Request: { name, email, phone, segment, owner_id }
  Response: { message, customer }

PATCH /:id
  Request: { name?, email?, phone?, segment?, health_score?, owner_id? }
  Response: { message, customer }

DELETE /:id
  Response: { message }
```

### Deals (`/api/v1/deals`) - Stubs Ready
```
GET /            # List all deals
GET /:id         # Get deal details
POST /           # Create deal
PATCH /:id       # Update deal
DELETE /:id      # Delete deal
POST /:id/stage  # Change stage
POST /:id/won    # Mark as won
POST /:id/lost   # Mark as lost
```

### Tickets (`/api/v1/tickets`) - Stubs Ready
```
GET /            # List all tickets
GET /:id         # Get ticket details
POST /           # Create ticket
PATCH /:id       # Update ticket
DELETE /:id      # Delete ticket
POST /:id/resolve  # Resolve ticket
POST /:id/csat   # Submit CSAT rating
```

### Campaigns (`/api/v1/campaigns`) - Stubs Ready
```
GET /            # List campaigns
GET /:id/roi     # Get ROI metrics
POST /           # Create campaign
PATCH /:id       # Update campaign
DELETE /:id      # Delete campaign
```

---

## 🎨 Frontend Pages

### Dashboard (`/`)
- **Metrics**: Total customers, opportunities, pipeline value, open tickets
- **Pipeline**: Value breakdown by stage (Prospecção, Qualificação, Proposta, Negociação, Fechado)
- **Activity**: Recent interactions, resolved tickets, upcoming SLAs

### Customers (`/customers`)
- **Search & Filter**: By name, email, segment, owner
- **Pagination**: 20 customers per page
- **Health Score**: Visual progress bar (0-100%)
- **Quick Actions**: View customer details

### Customer 360 (`/customers/:id`)
- **Customer Profile**: Name, email, phone, industry, segment, joined date
- **Health Score**: Visual gauge + interpretation
- **Opportunities**: Associated deals with stage and value
- **Tickets**: Open/in-progress support tickets
- **Interactions**: Recent communications (email, calls, notes)

### Login (`/login`)
- Email and password fields
- Error message display
- Demo credentials notice

---

## 🔧 Development Workflow

### Backend Development

```bash
cd server
npm run dev  # Start with nodemon (auto-restart on changes)
```

**Implement new endpoint:**
1. Create controller function in `controllers/`
2. Add route handler in `routes/`
3. Test with curl or Postman
4. Example adding a new endpoint:

```javascript
// controllers/MyController.js
export const myFunction = async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Success' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// routes/myroute.js
import { myFunction } from '../controllers/MyController.js'
router.get('/my-endpoint', authenticateToken, myFunction)
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start Vite dev server
```

**Implement new page:**
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Test in browser at http://localhost:5173

### Build for Production

```bash
# Backend
cd server
npm start  # NODE_ENV=production

# Frontend
cd frontend
npm run build  # Creates dist/ folder
npm preview    # Test production build locally
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# 1. Check PostgreSQL is running
psql -l  # Should list databases

# 2. Verify .env database settings
cat server/.env

# 3. Check credentials
psql -h localhost -U postgres -d meishop_crm

# 4. If needed, recreate database
dropdb meishop_crm
createdb meishop_crm
psql meishop_crm < database.sql
```

### "JWT authentication failed"
```bash
# 1. Ensure JWT_SECRET is set in .env
echo $JWT_SECRET

# 2. Clear browser localStorage
# Open DevTools > Application > Local Storage > Clear all

# 3. Re-login at http://localhost:5173/login
```

### "Axios CORS errors"
```bash
# 1. Backend .env must have correct FRONTEND_URL
FRONTEND_URL=http://localhost:5173

# 2. Frontend .env must have correct API URL
VITE_API_URL=http://localhost:3000/api/v1

# 3. Restart both servers
```

---

## 📈 Next Steps (Not Implemented)

### Phase 4: Deals & Pipeline Management
- Implement `DealController.js` (CRUD + stage transitions)
- Add Kanban board component in frontend
- Setup deal forecasting logic

### Phase 5: Ticket Management
- Implement `TicketController.js` with SLA tracking
- Add ticket priority & status workflows
- Create ticket queue dashboard

### Phase 6: Campaign Management
- Implement `CampaignController.js` with ROI tracking
- Email campaign automation via Mailchimp API
- Campaign analytics dashboard

### Phase 7: Marketing Automation
- Fix Mailchimp API authentication (currently 401 error)
- Re-run `mailchimp_automation.py` to create audience & templates
- Setup email automation workflows (21-day cold sequence + trial follow-up)

### Phase 8: Advanced Features
- WhatsApp integration via Twilio/Chatwoot
- Slack notifications for SLA alerts
- Advanced reporting & export
- Mobile app (React Native)

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)

---

## ✅ Checklist for Launch

- [ ] PostgreSQL database created and schema loaded
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Login page accessible and functional
- [ ] Dashboard loads with mock data
- [ ] Customers list with search & pagination works
- [ ] Customer detail page displays all sections
- [ ] POST request test: Create new customer via Postman
- [ ] Environment variables properly configured (.env files)
- [ ] JWT tokens persisting in localStorage
- [ ] CORS working (no browser console errors)

---

**Generated for MEISHOP CRM | Version 1.0 | 2026-01-16**
