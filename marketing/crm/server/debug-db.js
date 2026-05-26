#!/usr/bin/env node

/**
 * Debug Deals/Tickets - Verificar dados no database
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432,
  database: 'meishop_crm'
});

async function debug() {
  try {
    console.log('\n📊 DEBUG - Verificando dados no database...\n');

    // 1. Contar registros
    console.log('1️⃣  CONTAGEM DE REGISTROS:');
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM deals) as deals,
        (SELECT COUNT(*) FROM tickets) as tickets,
        (SELECT COUNT(*) FROM campaigns) as campaigns,
        (SELECT COUNT(*) FROM companies) as companies,
        (SELECT COUNT(*) FROM users) as users
    `);
    console.log(counts.rows[0]);

    // 2. Listar company IDs
    console.log('\n2️⃣  COMPANIES:');
    const companies = await pool.query('SELECT id, name FROM companies LIMIT 5');
    companies.rows.forEach(c => console.log(`   • ${c.name} (${c.id})`));

    // 3. Listar primeiro deal com tudo
    console.log('\n3️⃣  PRIMEIRO DEAL:');
    const deals = await pool.query('SELECT * FROM deals LIMIT 1');
    if (deals.rows.length > 0) {
      console.log(JSON.stringify(deals.rows[0], null, 2));
    } else {
      console.log('   ❌ Nenhum deal encontrado');
    }

    // 4. Listar primeiro ticket com tudo
    console.log('\n4️⃣  PRIMEIRO TICKET:');
    const tickets = await pool.query('SELECT * FROM tickets LIMIT 1');
    if (tickets.rows.length > 0) {
      console.log(JSON.stringify(tickets.rows[0], null, 2));
    } else {
      console.log('   ❌ Nenhum ticket encontrado');
    }

    // 5. Deals por company_id (admin user)
    console.log('\n5️⃣  DEALS FILTRADOS POR COMPANY_ID:');
    const adminUser = await pool.query(`
      SELECT company_id FROM users WHERE email = 'admin@meishop.com'
    `);
    
    if (adminUser.rows.length > 0) {
      const companyId = adminUser.rows[0].company_id;
      console.log(`   Company ID do admin: ${companyId}`);
      
      const dealsFiltered = await pool.query(
        'SELECT id, title, company_id FROM deals WHERE company_id = $1',
        [companyId]
      );
      console.log(`   Deals com esse company_id: ${dealsFiltered.rows.length}`);
      dealsFiltered.rows.slice(0, 3).forEach(d => {
        console.log(`     • ${d.title} (${d.id})`);
      });
    }

    // 6. Comparar queries
    console.log('\n6️⃣  QUERY COMPARISON:');
    
    // Query que campanha usa (funciona)
    const campaignQuery = await pool.query(`
      SELECT id, name, budget FROM campaigns LIMIT 1
    `);
    console.log('   Campaigns query (funciona):');
    console.log(`     ✅ ${campaignQuery.rows.length} records`);

    // Query que deals deveria usar
    const dealsQuery = await pool.query(`
      SELECT id, title, stage FROM deals LIMIT 1
    `);
    console.log('   Deals query:');
    console.log(`     ${dealsQuery.rows.length > 0 ? '✅' : '❌'} ${dealsQuery.rows.length} records`);

    console.log('\n7️⃣  SCHEMA DETALHES:');
    const columns = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('deals', 'tickets', 'campaigns')
      ORDER BY table_name, ordinal_position
    `);
    
    let currentTable = '';
    columns.rows.forEach(col => {
      if (col.table_name !== currentTable) {
        console.log(`\n   ${col.table_name}:`);
        currentTable = col.table_name;
      }
      console.log(`     - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Debug completo!\n');

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

debug();
