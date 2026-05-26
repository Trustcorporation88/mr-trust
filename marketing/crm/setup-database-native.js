#!/usr/bin/env node

/**
 * PostgreSQL Database Setup for MEISHOP CRM
 * Using native Node.js pg driver (no external psql.exe)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  dbUser: 'postgres',
  dbPassword: '', // Deixar vazio se usando trust auth no pg_hba.conf
  dbName: 'meishop_crm',
  dbHost: '127.0.0.1',
  dbPort: 5432,
  databaseSqlPath: path.join(__dirname, 'database.sql')
};

console.log('========================================');
console.log('  MEISHOP CRM - PostgreSQL Setup');
console.log('========================================');
console.log('');

// Verificar se database.sql existe
if (!fs.existsSync(config.databaseSqlPath)) {
  console.error(`[ERROR] database.sql not found at ${config.databaseSqlPath}`);
  process.exit(1);
}

console.log('[OK] database.sql found');
console.log('');

async function setup() {
  let client = null;
  
  try {
    console.log(`Connecting to PostgreSQL as '${config.dbUser}' at ${config.dbHost}:${config.dbPort}...`);
    console.log('');

    // Conectar ao database padrão (postgres) para criar nova database
    console.log('  -> Checking PostgreSQL connection...');
    client = new Client({
      user: config.dbUser,
      password: config.dbPassword,
      host: config.dbHost,
      port: config.dbPort,
      database: 'postgres'
    });

    await client.connect();
    console.log('  [OK] Connection OK');

    // Verificar se database já existe
    console.log('');
    console.log(`  -> Checking if database '${config.dbName}' exists...`);
    
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.dbName]
    );

    if (dbCheckResult.rows.length > 0) {
      console.log(`  [WARN] Database '${config.dbName}' already exists`);
      console.log('  -> Dropping existing database...');
      
      // Encerrar conexões antes de dropar
      await client.query(`ALTER DATABASE ${config.dbName} CONNECTION LIMIT 0;`);
      await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) 
                          FROM pg_stat_activity 
                          WHERE pg_stat_activity.datname = $1 
                          AND pid <> pg_backend_pid();`, [config.dbName]);
      
      // Dropar database
      await client.query(`DROP DATABASE IF EXISTS ${config.dbName};`);
      console.log('  [OK] Database dropped');
    }

    // Criar database
    console.log('');
    console.log(`  -> Creating database '${config.dbName}'...`);
    await client.query(`CREATE DATABASE ${config.dbName};`);
    console.log('  [OK] Database created');

    // Fechar conexão com postgres e conectar à nova database
    await client.end();

    console.log('');
    console.log('  -> Executing schema (database.sql)...');
    
    client = new Client({
      user: config.dbUser,
      password: config.dbPassword,
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName
    });

    await client.connect();

    // Executar schema de uma única vez (sem split!)
    const sqlContent = fs.readFileSync(config.databaseSqlPath, 'utf8');
    
    try {
      await client.query(sqlContent);
    } catch (err) {
      // Se falhar na primeira vez, tente quebrar por ;; (para separar statements com triggers)
      if (err.message.includes('dólares') || err.message.includes('$$')) {
        console.log('  [WARN] Retrying with alternative parsing...');
        
        // Quebrar apenas por ;;
        const statements = sqlContent
          .split(';;')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        for (let stmt of statements) {
          // Garantir que cada statement termina com ;
          if (!stmt.endsWith(';')) {
            stmt += ';';
          }
          try {
            await client.query(stmt);
          } catch (innerErr) {
            if (innerErr.message.includes('already exists')) {
              // Ignorar erros de "já existe"
            } else {
              throw innerErr;
            }
          }
        }
      } else {
        throw err;
      }
    }

    console.log('  [OK] Schema applied');

    // Verificar tabelas criadas
    console.log('');
    console.log('  -> Verifying created tables...');
    
    const tablesResult = await client.query(
      `SELECT COUNT(*) FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`
    );

    const tableCount = parseInt(tablesResult.rows[0].count, 10);
    console.log(`  [OK] Tables created: ${tableCount}`);

    await client.end();

    console.log('');
    console.log('========================================');
    console.log('  DATABASE READY!');
    console.log('========================================');
    console.log('');
    console.log('Next steps:');
    console.log("  1. Open new PowerShell terminal");
    console.log("  2. cd 'C:\\Mr.Holmes\\marketing\\crm\\server'");
    console.log('  3. npm run dev');
    console.log('');
    console.log('  In another terminal:');
    console.log("  1. cd 'C:\\Mr.Holmes\\marketing\\crm\\frontend'");
    console.log('  2. npm run dev');
    console.log('');
    console.log('  Browser: http://localhost:5173');
    console.log('  Login: admin@meishop.com / admin123');
    console.log('');

  } catch (err) {
    console.error('');
    console.error('[ERROR]', err.message);
    console.error('');
    
    if (err.message.includes('password')) {
      console.error('Hint: PostgreSQL password may be incorrect.');
      console.error('Edit this script and change the dbPassword value.');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        // Ignore
      }
    }
  }
}

// Executar setup
setup();
