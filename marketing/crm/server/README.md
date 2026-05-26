# MEISHOP CRM - Backend API

Backend Node.js/Express com autenticação JWT, PostgreSQL e estrutura de rotas pronta para CRM.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env com suas credenciais do PostgreSQL
npm run dev
```

Server rodando em: **http://localhost:3000**

Health check: `curl http://localhost:3000/health`

## 📦 Estrutura

```
server/
├── config/
│   └── database.js          # Pool PostgreSQL
├── middleware/
│   └── auth.js              # JWT & Authorization
├── controllers/
│   ├── AuthController.js    # Login/Register
│   └── CustomerController.js # CRUD Customers
├── routes/
│   ├── auth.js
│   ├── customers.js
│   ├── deals.js
│   ├── tickets.js
│   └── campaigns.js
├── server.js                # Express app
├── package.json
├── .env.example
└── .env                     # Create from .env.example
```

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@meishop.com.br", "password": "senha123"}'
```

**Resposta:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@meishop.com.br",
    "fullName": "User Name",
    "role": "sales_rep"
  },
  "token": "jwt_token_here"
}
```

### Usar token
```bash
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer jwt_token_here"
```

## 📡 Endpoints Principais

### Customers
- `GET /api/v1/customers` - Listar (paginação, busca, filtro)
- `GET /api/v1/customers/:id` - Detalhes completos (Customer 360)
- `POST /api/v1/customers` - Criar
- `PATCH /api/v1/customers/:id` - Atualizar
- `DELETE /api/v1/customers/:id` - Deletar

### Auth
- `POST /api/v1/auth/login` - Fazer login
- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/refresh` - Renovar token

## 🗄️ Variáveis de Ambiente

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meishop_crm
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Frontend CORS
FRONTEND_URL=http://localhost:5173

# Email (Opcional)
MAILCHIMP_API_KEY=xxx-us15
MAILCHIMP_SERVER=us15
MAILCHIMP_AUDIENCE_ID=xxx
```

## 🧪 Testar Endpoints

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com.br",
    "phone": "+55 11 98765-4321",
    "segment": "PME",
    "owner_id": "user-uuid-here"
  }'
```

### Listar Clientes
```bash
# Todos
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Com busca
curl "http://localhost:3000/api/v1/customers?search=joao&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Com filtro
curl "http://localhost:3000/api/v1/customers?segment=PME&owner_id=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Customer 360
```bash
curl http://localhost:3000/api/v1/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Retorna:
- Customer (info completa)
- Interactions (últimas 10)
- Deals (oportunidades ativas)
- Tickets (tickets abertos)

## 🔧 Desenvolvimento

### Estrutura de Um Controller

```javascript
export const myFunction = async (req, res) => {
  try {
    const { paramName } = req.params;
    const companyId = req.user.companyId; // Do JWT

    const result = await pool.query(
      'SELECT * FROM table WHERE id = $1 AND company_id = $2',
      [paramName, companyId]
    );

    res.json({
      data: result.rows,
      total: result.rowCount
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
```

### Adicionar Nova Rota

1. Criar função em `controllers/MyController.js`
2. Importar em `routes/myroute.js`
3. Registrar em `server.js`:

```javascript
import myRoutes from './routes/myroute.js'
app.use('/api/v1/myroute', myRoutes)
```

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Verificar PostgreSQL
psql -l

# Verificar credenciais .env
cat .env

# Reconectar
psql -h localhost -U postgres -d meishop_crm
```

### JWT Token Inválido
```bash
# Gerar novo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Atualizar .env
JWT_SECRET=seu_novo_secret_aqui
```

### CORS Error
```bash
# Verificar FRONTEND_URL em .env
# Deve ser http://localhost:5173 (ou port correto)
```

## 📚 Dependências Principais

- `express` - Web framework
- `pg` - PostgreSQL driver
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `morgan` - HTTP logging
- `dotenv` - Environment variables
- `validator` - Input validation

## 🚀 Production Deployment

```bash
# Build
npm install --production

# Start
NODE_ENV=production PORT=3000 npm start

# Com PM2 (recomendado)
pm2 start server.js --name "meishop-crm-api" --instances max
```

## 📞 Suporte

- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://postgresql.org/docs)
- [JWT.io](https://jwt.io/)
- [Postman Collection](./postman_collection.json) - Em breve

---

**MEISHOP CRM Backend** | v1.0.0 | 2026-01-16
