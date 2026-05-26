#!/usr/bin/env node
import pool from './config/database.js';

const getSchema = async () => {
  const tables = ['companies', 'users', 'deals', 'tickets', 'campaigns'];
  
  for (const table of tables) {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    
    console.log(`\n${table.toUpperCase()}:`);
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
  }
  
  process.exit(0);
};

getSchema();
