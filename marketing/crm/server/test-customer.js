#!/usr/bin/env node

import pool from './config/database.js';

async function checkCustomerSchema() {
  try {
    // Ver columns do customers
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position
    `);

    console.log('📋 SCHEMA de CUSTOMERS:\n');
    columns.rows.forEach(c => {
      console.log(`   • ${c.column_name} (${c.data_type}) - ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Tentar inserir um customer
    console.log('\n🔍 Testando INSERT...\n');
    
    const result = await pool.query(`
      INSERT INTO customers (id, company_id, name, email, phone, city, created_at)
      VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        '24621fc4-8ee7-457f-a142-7c73aa6eeca5',
        'Test Customer',
        'test@email.com',
        '1199999999',
        'São Paulo',
        NOW()
      )
      RETURNING *
    `);

    console.log('✅ Customer inserido!');
    console.log(result.rows[0]);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

checkCustomerSchema();
