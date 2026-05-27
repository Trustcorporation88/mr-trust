# 🚀 Production Deployment - Team Reference

## 🌐 Production URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app |
| **API Base** | https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api |
| **Vercel Dashboard** | https://vercel.com/dashboard/crm |

---

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | Login with email/password | ❌ No |
| POST | `/api/auth/register` | Create new user account | ❌ No |
| POST | `/api/auth/refresh` | Renew JWT token | ❌ No |

### Services

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/services` | List available services | ✅ Yes (Bearer token) |

---

## 📝 API Request Examples

### Login
```bash
curl -X POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "12345678"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Register
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

### Refresh Token
```bash
curl -X POST https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Services (Requires JWT)
```bash
curl -X GET https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/services \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 Authentication Details

- **Token Type:** JWT (JSON Web Token)
- **Token Expiry:** 7 days
- **Algorithm:** HS256
- **Header Name:** `Authorization`
- **Header Format:** `Bearer <token>`

---

## 💾 Database

| Property | Value |
|----------|-------|
| **Type** | PostgreSQL 18 |
| **Host** | ajcpqhuanqipnwzplqe.supabase.co |
| **Port** | 5432 |
| **SSL** | Enabled |
| **Connection Pooling** | Yes (max 2 connections per serverless function) |

---

## 🧪 Test Credentials

```
Email: admin@example.com
Password: 12345678
```

**⚠️ Change in production!**

---

## ✅ Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend** | 🟢 Live | Vite React application |
| **API** | 🟢 Live | 3 auth handlers operational |
| **Database** | 🟢 Connected | Supabase PostgreSQL |
| **SSL/HTTPS** | 🟢 Active | Vercel managed certificates |
| **Environment** | 🟢 Production | All 9 variables encrypted |

---

## 🔄 Git Integration

- **Repository:** GitHub
- **Branch:** main
- **Deploy:** Automatic on push
- **Build Time:** ~10 seconds
- **Deployment Time:** ~25 seconds

---

## 📊 Monitoring

| Tool | Status | Purpose |
|------|--------|---------|
| **Vercel Analytics** | ✅ Active | Performance metrics, error tracking |
| **Email Alerts** | ✅ Enabled | Deployment notifications |
| **GitHub Checks** | ✅ Active | PR deployment status |

**To add monitoring:**
- See `MONITORING_SETUP.md` for integration guides

---

## 🆘 Troubleshooting

### API Returns 502 Bad Gateway
1. Check Vercel deployment status: https://vercel.com/dashboard/crm
2. Verify database credentials in Vercel settings
3. Check Vercel function logs

### Frontend Shows "Cannot Connect to API"
1. Verify VITE_API_URL environment variable
2. Check CORS headers on API endpoints
3. Clear browser cache and reload

### Login Returns 401 Unauthorized
1. Verify user exists in database
2. Check password is correct
3. Confirm user is_active = true

---

## 📱 Quick Health Check

```bash
# Frontend
curl -I https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app

# API
curl -I https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api/services

# Expected: HTTP 200
```

---

## 📞 Support

**Issue?**
1. Check `/PRODUCTION_TEST_GUIDE.md` for detailed testing
2. Review `/MONITORING_SETUP.md` for monitoring configuration
3. Check Vercel dashboard for deployment errors
4. Review database connection in Vercel environment variables

---

**Status:** 🟢 Production Ready
**Team:** Dev Ops Automation
**Last Updated:** 2024-12-XX
