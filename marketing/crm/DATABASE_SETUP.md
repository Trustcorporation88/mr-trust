# 🗄️ Database Schema Setup - Supabase SQL

## 📋 Setup Instructions

Copie e execute CADA seção abaixo no [Supabase SQL Editor](https://supabase.com/dashboard/project/atjcpqhuanqipnwzplqe/sql/new)

---

## ✅ STEP 1: Create Companies Table

```sql
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  subscription_plan VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Expected Result:** `Success. No rows returned`

---

## ✅ STEP 2: Create Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Expected Result:** `Success. No rows returned`

---

## ✅ STEP 3: Create Indexes (Optional but Recommended)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
```

---

## ✅ STEP 4: Insert Test Company

```sql
INSERT INTO companies (name, cnpj, subscription_plan, is_active)
VALUES ('Test Company', '12345678000190', 'starter_299', true)
ON CONFLICT (cnpj) DO NOTHING;
```

**Expected Result:** `Success. No rows returned`

---

## ✅ STEP 5: Insert Test User

```sql
INSERT INTO users (email, password_hash, full_name, role, company_id, is_active)
SELECT
  'flavio@dicasmei.com.br',
  '$2b$10$NCLzTepEcBrKr650ed9gs.wiFJebTwRUwSEXHTs6Ycxs18ThFft3a',
  'Flavio',
  'admin',
  (SELECT id FROM companies WHERE cnpj = '12345678000190' LIMIT 1),
  true
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = true;
```

**Expected Result:** `Success. No rows returned`

---

## ✅ STEP 6: Verify Setup

```sql
SELECT 
  'companies' as table_name,
  COUNT(*) as row_count
FROM companies

UNION ALL

SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users;
```

**Expected Result:**
```
table_name | row_count
-----------|----------
companies  | 1
users      | 1
```

---

## ✅ STEP 7: Verify Test User

```sql
SELECT id, email, full_name, role, is_active 
FROM users 
WHERE email = 'flavio@dicasmei.com.br';
```

**Expected Result:**
```
id                   | email                  | full_name | role  | is_active
--------------------|------------------------|-----------|-------|----------
[uuid]               | flavio@dicasmei.com.br | Flavio    | admin | true
```

---

## 🔑 Test Credentials

Once setup is complete:

- **Email:** `flavio@dicasmei.com.br`
- **Password:** `Crm57592$`

These credentials can now be used to test the authentication endpoints.

---

## 🧪 Quick Test After Setup

Once database is ready, test authentication with:

```bash
cd c:\Mr.Holmes\marketing\crm
node test-auth-production.js
```

This will test:
1. Login endpoint
2. JWT token generation
3. Token refresh
4. Protected API access

---

## 🆘 Troubleshooting

### "relation does not exist" error
- Ensure you completed STEP 1 and STEP 2 first
- Tables must exist before running INSERT queries

### "duplicate key value violates unique constraint"
- The email or CNPJ already exists
- Use ON CONFLICT clauses (included in steps above)

### "Failed to connect" when running Node.js script
- Verify Vercel deployment is accessible
- Check VITE_API_URL environment variable

---

**📅 Last Updated:** 2025-05-27
**Status:** Ready for manual execution in Supabase UI
