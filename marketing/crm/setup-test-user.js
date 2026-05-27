#!/usr/bin/env node

/**
 * Setup test user in Supabase database
 * Creates admin user for authentication testing
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'ajcpqhuanqipnwzplqe.supabase.co',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function setupTestUser() {
  try {
    console.log('🔧 Setting up test user in production database...\n');

    const client = await pool.connect();

    // 1. Create company
    console.log('1️⃣ Creating test company...');
    const companyResult = await client.query(
      `INSERT INTO companies (name, cnpj, subscription_plan, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Test Company', '12345678000190', 'starter_299', true]
    );
    const companyId = companyResult.rows[0].id;
    console.log(`   ✅ Company created: ${companyId}\n`);

    // 2. Create user
    console.log('2️⃣ Creating test user...');
    const password = '12345678';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, company_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email`,
      ['admin@example.com', passwordHash, 'Admin User', 'admin', companyId, true]
    );
    const userId = userResult.rows[0].id;
    const userEmail = userResult.rows[0].email;
    console.log(`   ✅ User created: ${userId} (${userEmail})\n`);

    // 3. Verify
    console.log('3️⃣ Verifying user...');
    const verifyResult = await client.query(
      'SELECT id, email, full_name, role FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log(`   ✅ User verified:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Name: ${user.full_name}`);
      console.log(`      Role: ${user.role}\n`);
    }

    client.release();

    console.log('═══════════════════════════════════════');
    console.log('✅ Test user setup complete!');
    console.log('═══════════════════════════════════════\n');
    console.log('📋 Test Credentials:');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: ${password}\n`);
    console.log('🚀 Ready to test authentication!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupTestUser();
