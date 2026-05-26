#!/usr/bin/env node

import pool from './config/database.js';

async function checkDealsStatus() {
  try {
    const result = await pool.query(`
      SELECT id, title, status FROM deals WHERE company_id = '24621fc4-8ee7-457f-a142-7c73aa6eeca5'
    `);

    console.log('Deals status:\n');
    result.rows.forEach(d => {
      console.log(`  • ${d.title} -> status='${d.status}'`);
    });

    console.log('\n---\n');
    console.log('Atualizando para status="open"...\n');

    await pool.query(`
      UPDATE deals SET status = 'open' WHERE status = 'active'
    `);

    const updated = await pool.query(`
      SELECT id, title, status FROM deals WHERE company_id = '24621fc4-8ee7-457f-a142-7c73aa6eeca5'
    `);

    console.log('Após atualização:\n');
    updated.rows.forEach(d => {
      console.log(`  • ${d.title} -> status='${d.status}'`);
    });

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

checkDealsStatus();
