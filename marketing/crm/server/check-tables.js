#!/usr/bin/env node

import pool from './config/database.js';

async function checkSchema() {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 TABELAS NO DATABASE:\n');
    tables.rows.forEach(t => console.log(`   • ${t.table_name}`));

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
