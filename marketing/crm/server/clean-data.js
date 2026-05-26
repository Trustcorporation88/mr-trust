#!/usr/bin/env node

/**
 * Limpar dados de Deals, Tickets e Customers (manter companies/users/campaigns)
 */

import pool from './config/database.js';

const clean = async () => {
  try {
    console.log('🧹 Limpando dados...\n');
    
    // Deletar na ordem correta (deals antes de customers por FK)
    await pool.query('DELETE FROM deals');
    console.log('✅ Deals deletados');
    
    await pool.query('DELETE FROM tickets');
    console.log('✅ Tickets deletados');
    
    await pool.query('DELETE FROM customers');
    console.log('✅ Customers deletados');
    
    console.log('\n✅ Limpeza completa!');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
};

clean();
