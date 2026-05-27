#!/usr/bin/env node

/**
 * Direct Supabase Database Setup
 * Connects directly to Supabase PostgreSQL and creates schema
 */

const { Client } = require('pg');

// Supabase connection (use environment variables in production)
const client = new Client({
  host: 'ajcpqhuanqipnwzplqe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'Crm57592$',
  ssl: { rejectUnauthorized: false }
});

const schemaSQL = `
-- Drop existing tables if they exist (cascade to handle foreign keys)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  subscription_plan VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);

-- Insert test company
INSERT INTO companies (name, cnpj, subscription_plan, is_active)
VALUES ('Test Company', '12345678000190', 'starter_299', true)
ON CONFLICT (cnpj) DO NOTHING;

-- Insert test user  
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
`;

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to Supabase!');

    console.log('\n📊 Creating schema...');
    
    // Execute each statement separately to better handle errors
    const statements = schemaSQL.split(';').filter(s => s.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim() + ';';
      if (stmt.trim().length > 1) {
        try {
          console.log(`   [${i + 1}/${statements.length}] Executing...`);
          await client.query(stmt);
          console.log(`   ✅ Statement ${i + 1} complete`);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.error(`   ⚠️  Statement ${i + 1}: ${err.message}`);
          }
        }
      }
    }

    console.log('\n🔍 Verifying setup...');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`\n📋 Tables created:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Count records
    const companiesResult = await client.query('SELECT COUNT(*) as count FROM companies;');
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users;');
    
    console.log(`\n📈 Data:`);
    console.log(`   Companies: ${companiesResult.rows[0].count}`);
    console.log(`   Users: ${usersResult.rows[0].count}`);

    // Verify test user
    const testUserResult = await client.query(`
      SELECT id, email, full_name, role, is_active 
      FROM users 
      WHERE email = 'flavio@dicasmei.com.br'
      LIMIT 1;
    `);

    if (testUserResult.rows.length > 0) {
      const user = testUserResult.rows[0];
      console.log(`\n✅ Test User Verified:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Full Name: ${user.full_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
    }

    console.log(`\n🎉 Database setup complete!\n`);
    console.log(`📝 Test Credentials for Login Testing:`);
    console.log(`   Email: flavio@dicasmei.com.br`);
    console.log(`   Password: Crm57592$\n`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
