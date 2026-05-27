-- ============================================
-- CRM Test User Setup Script
-- Execute in Supabase SQL Editor
-- ============================================

-- 1. Create test company
INSERT INTO companies (name, cnpj, subscription_plan, is_active)
VALUES ('Test Company', '12345678000190', 'starter_299', true)
ON CONFLICT (cnpj) DO NOTHING;

-- 2. Get company ID
WITH company AS (
  SELECT id FROM companies WHERE cnpj = '12345678000190' LIMIT 1
)
-- 3. Create test user with pre-hashed password
-- Password: 12345678
-- Hash: $2a$10$9I/t9aDWX6MiNsqYKkv6C.AJLRu0zFG5gAO6YzG6ZQXjLN.ZWiQee
INSERT INTO users (email, password_hash, full_name, role, company_id, is_active)
SELECT 
  'admin@example.com',
  '$2a$10$9I/t9aDWX6MiNsqYKkv6C.AJLRu0zFG5gAO6YzG6ZQXjLN.ZWiQee',
  'Admin User',
  'admin',
  id,
  true
FROM company
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = true;

-- 4. Verify user was created
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE email = 'admin@example.com';
