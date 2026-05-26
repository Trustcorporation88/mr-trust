#!/usr/bin/env node

/**
 * Debug Insert - Tentar inserir um deal e ver erro exato
 */

import pool from './config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function test() {
  try {
    console.log('🔍 Testando INSERT de DEAL...\n');

    // Dados conhecidos
    const companyId = '24621fc4-8ee7-457f-a142-7c73aa6eeca5';
    const userId = 'c2fba736-a7ac-466a-b8ad-5f8089163b85';
    
    const dealId = uuidv4();
    const customerId = uuidv4();

    console.log(`Company ID: ${companyId}`);
    console.log(`User ID:    ${userId}`);
    console.log(`Deal ID:    ${dealId}`);
    console.log(`Customer ID: ${customerId}\n`);

    const result = await pool.query(
      `INSERT INTO deals (id, company_id, customer_id, title, description, stage, amount, probability, currency, expected_close_date, owner_id, created_by_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()::date + interval '30 days', $10, $11, $12, NOW())`,
      [
        dealId,
        companyId,
        customerId,
        'Test Deal',
        'This is a test deal',
        'lead',
        15000,
        20,
        'BRL',
        userId,
        userId,
        'active'
      ]
    );

    console.log('✅ INSERT bem-sucedido!');
    console.log(result);

    // Verificar se dados foram salvos
    const verify = await pool.query('SELECT COUNT(*) as total FROM deals');
    console.log(`\n📊 Total deals agora: ${verify.rows[0].total}`);

  } catch (err) {
    console.error('❌ ERRO EXATO:');
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
