# 🚀 Production Deployment Testing Guide

## Overview
Sistema CRM em produção no Vercel com autenticação JWT e PostgreSQL Supabase.

**Production URLs:**
- 🌐 Frontend: https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app
- 📡 API Base: https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api
- 🔗 Vercel Project: https://vercel.com/trustcorporation88s-projects/crm

---

## 📋 Step 1: Create Test User in Database

### Option A: Using Supabase SQL Editor (Recommended)

1. Navigate to: https://supabase.com/dashboard
2. Select project: **PostgreSQL CRM**
3. Go to: **SQL Editor** → **New Query**
4. Copy and paste contents of `setup-test-user.sql`
5. Execute the query
6. Verify output shows user created with email `admin@example.com`

**SQL Script Location:**
```
c:/Mr.Holmes/marketing/crm/setup-test-user.sql
```

**Test Credentials After Setup:**
```
Email: admin@example.com
Password: 12345678
```

### Option B: Using Node.js Script (If VPN Available)

```bash
cd c:/Mr.Holmes/marketing/crm
node setup-test-user.js
```

**Requirements:**
- Network connectivity to Supabase
- Environment variables set:
  - `DB_HOST=ajcpqhuanqipnwzplqe.supabase.co`
  - `DB_PORT=5432`
  - `DB_NAME=postgres`
  - `DB_USER=postgres`
  - `DB_PASSWORD=<from Vercel env vars>`
  - `DB_SSL=true`

---

## 🧪 Step 2: Test Authentication Endpoints

### Running Authentication Tests

```bash
cd c:/Mr.Holmes/marketing/crm
node test-auth-production.js
```

**Test Coverage:**
1. ✅ Login with email/password → JWT token
2. ✅ JWT structure validation
3. ✅ Token refresh
4. ✅ Services API access with token

**Expected Output:**
```
🧪 Production Authentication Test Suite

═══════════════════════════════════════
Test 1️⃣ : Login with credentials
═══════════════════════════════════════
POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/login
Body: {"email":"admin@example.com","password":"****"}

Status: 200
Response: {
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

✅ Login successful

Token: eyJhbGciOiJIUzI1NiIsIn...B3Z6L2zAKYWE

═══════════════════════════════════════
Test 2️⃣ : Validate JWT Token Structure
═══════════════════════════════════════
Header: {"alg":"HS256","typ":"JWT"}
Payload: {
  "id": "...",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
Signature: (present)

⏱️  Expires at: 2024-12-XX 14:31:30.000Z
⏱️  Time remaining: 168 hours

✅ JWT structure valid

═══════════════════════════════════════
✅ ALL TESTS PASSED
═══════════════════════════════════════

📋 Summary:
  ✅ Login endpoint: Working
  ✅ JWT token generation: Working
  ✅ Token structure: Valid
  ✅ Token refresh: Working
  ✅ Services API: Accessible

🚀 Production deployment is ready for use!
```

---

## 🔌 Step 3: Manual API Testing

### Using cURL

#### Login Endpoint
```bash
curl -X POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "12345678"
  }'
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "role": "admin",
    "companyId": "550e8400-e29b-41d4-a716-446655440001"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJjb21wYW55SWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJpYXQiOjE3MDM0MTI2OTAsImV4cCI6MTcwNDA3NDI5MH0.B3Z6L2zAKYWE-z5GYvZeF6X7K8mN9pQrS4tUvWxYz1E"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

#### Register New User
```bash
curl -X POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "companyId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Token
```bash
curl -X POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📊 Step 4: Monitor Production Endpoints

### Vercel Monitoring Dashboard

1. Navigate to: https://vercel.com/dashboard
2. Select project: **crm**
3. View metrics:
   - **Deployment** tab: Build logs, deployment history
   - **Analytics** tab: Function invocations, edge cache hit rates
   - **Functions** tab: Serverless function status and performance
   - **Settings** → **Integrations**: Connect monitoring tools

### Available Monitoring Integrations

**Recommended:**
- 📊 **DataDog**: APM and log aggregation
- 📈 **New Relic**: Performance monitoring
- 🔔 **PagerDuty**: Incident alerting
- 📡 **Sentry**: Error tracking

### Manual Health Checks

Check frontend accessibility:
```bash
curl -I https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app
```

Expected response:
```
HTTP/2 200
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
```

Check API health:
```bash
curl -I https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/services
```

Expected response:
```
HTTP/2 200
Content-Type: application/json
```

---

## 🔐 Environment Variables (Verified in Production)

All 9 variables configured and encrypted in Vercel:

| Variable | Status | Scope |
|----------|--------|-------|
| `DB_HOST` | ✅ Encrypted | Production |
| `DB_PORT` | ✅ Encrypted | Production |
| `DB_NAME` | ✅ Encrypted | Production |
| `DB_USER` | ✅ Encrypted | Production |
| `DB_PASSWORD` | ✅ Encrypted | Production |
| `DB_SSL` | ✅ Encrypted | Production |
| `JWT_SECRET` | ✅ Encrypted | Production |
| `JWT_EXPIRE` | ✅ Encrypted | Production |
| `NODE_ENV` | ✅ Encrypted | Production |

**Verification:**
```bash
vercel env list --prod
```

---

## 📦 Deployment Summary

| Component | Status | Details |
|-----------|--------|---------|
| Frontend Build | ✅ Success | Vite compiled, 111 modules |
| Backend Functions | ✅ Success | 3 auth handlers + services |
| Database Connection | ✅ Configured | Supabase PostgreSQL SSL |
| Environment Vars | ✅ Encrypted | 9/9 variables in production |
| Git Integration | ✅ Active | Auto-deploy on main branch |
| SSL/HTTPS | ✅ Active | Vercel managed certificates |

---

## 🔄 Troubleshooting

### Login Returns 401 "Invalid credentials"
- **Check**: User exists in database with correct email
- **Check**: Password hash matches bcrypt format
- **Solution**: Re-run `setup-test-user.sql` to recreate user

### Token Refresh Returns 403
- **Check**: Token is properly formatted JWT
- **Check**: Token hasn't expired yet (exp > current time)
- **Solution**: Generate new token via login endpoint

### API Returns 502 Bad Gateway
- **Check**: Vercel deployment status (https://vercel.com/dashboard/crm)
- **Check**: Database connectivity from Vercel functions
- **Solution**: Check database credentials in Vercel env vars

### Frontend Shows "Cannot connect to API"
- **Check**: `VITE_API_URL` environment variable in frontend/.env.production
- **Check**: CORS headers on API endpoints
- **Solution**: Rebuild frontend with correct VITE_API_URL

---

## 📚 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/refresh` | Renew JWT token |

### Services Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all available services |

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  # Required for protected endpoints
User-Agent: CRM-Client/1.0
```

---

## 🎯 Next Steps

1. ✅ Create test user in Supabase
2. ✅ Run authentication tests
3. ⏳ **Configure monitoring alerts** (See Step 4)
4. ⏳ **Set up CI/CD monitoring** (GitHub Actions + Vercel)
5. ⏳ **Document team endpoints** (Share URLs with team)

---

## 📞 Support

**Production Deployment Issue?**
- Check Vercel dashboard: https://vercel.com/dashboard/crm
- View deployment logs: Vercel → Deployments → View build logs
- Database connection: Verify DB_* env vars in Vercel Settings

**Questions about endpoints?**
- See API Endpoints Reference section above
- Check `/api/services` response for available operations

---

**Last Updated:** 2024-12-XX
**Status:** 🟢 Production Ready
**Team:** Dev Ops Automation
