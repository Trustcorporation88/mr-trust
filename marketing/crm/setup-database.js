#!/usr/bin/env node

/**
 * PostgreSQL Database Setup for MEISHOP CRM
 * Node.js script to create database and apply schema
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = {
  postgresVersion: '18',
  dbUser: 'postgres',
  dbPassword: 'postgres', // Pode ser alterado via env var: DB_PASSWORD
  dbName: 'meishop_crm',
  dbHost: '127.0.0.1',  // Usar IPv4 explícito em vez de localhost
  postgresPath: 'C:\\Program Files\\PostgreSQL\\18\\bin',
  databaseSqlPath: path.join(__dirname, 'database.sql')
};

// Permitir sobrescrever senha via env var
if (process.env.DB_PASSWORD) {
  config.dbPassword = process.env.DB_PASSWORD;
}

console.log('========================================');
console.log('  MEISHOP CRM - PostgreSQL Setup');
console.log('========================================');
console.log('');

// Verificar se postgres está instalado
const psqlPath = path.join(config.postgresPath, 'psql.exe');
if (!fs.existsSync(psqlPath)) {
  console.error(`[ERROR] PostgreSQL not found at ${config.postgresPath}`);
  console.error('   Install from: https://www.postgresql.org/download/windows/');
  process.exit(1);
}

console.log(`[OK] PostgreSQL ${config.postgresVersion} found`);
console.log('');

// Verificar se database.sql existe
if (!fs.existsSync(config.databaseSqlPath)) {
  console.error(`[ERROR] database.sql not found at ${config.databaseSqlPath}`);
  process.exit(1);
}

console.log('[OK] database.sql found');
console.log('');

/**
 * Execute psql command
 */
function executePsql(args, input = null) {
  return new Promise((resolve, reject) => {
    const psql = spawn(psqlPath, args, {
      env: {
        ...process.env,
        PGPASSWORD: config.dbPassword
      }
    });

    let stdout = '';
    let stderr = '';

    psql.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    psql.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    if (input) {
      psql.stdin.write(input);
      psql.stdin.end();
    }

    psql.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject({ stdout, stderr, code });
      }
    });

    psql.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main setup process
 */
async function setup() {
  try {
    console.log(`Connecting to PostgreSQL as '${config.dbUser}'...`);
    console.log('');

    // Verificar conexao
    console.log('  -> Checking PostgreSQL connection...');
    try {
      await executePsql([
        '-U', config.dbUser,
        '-h', config.dbHost,
        '-c', 'SELECT version();'
      ]);
      console.log('  [OK] Connection OK');
    } catch (err) {
      // Se falhar com a senha padrão, tenta sem senha (trust)
      if (err.stderr && err.stderr.includes('FATAL')) {
        console.log('  [WARN] Connection failed with password, trying without...');
        try {
          await executePsql([
            '-U', config.dbUser,
            '-h', config.dbHost,
            '-c', 'SELECT version();'
          ]);
          console.log('  [OK] Connection OK (trust auth)');
          config.dbPassword = ''; // Sem senha
        } catch (err2) {
          throw new Error(`Cannot connect to PostgreSQL: ${err2.stderr || err2.message}`);
        }
      } else {
        throw err;
      }
    }

    // Verificar se database já existe
    console.log('');
    console.log(`  -> Checking if database '${config.dbName}' exists...`);
    try {
      const result = await executePsql([
        '-U', config.dbUser,
        '-h', config.dbHost,
        '-l'
      ]);

      if (result.stdout.includes(config.dbName)) {
        console.log(`  [WARN] Database '${config.dbName}' already exists`);
        console.log('  -> Dropping existing database...');
        await executePsql([
          '-U', config.dbUser,
          '-h', config.dbHost,
          '-c', `DROP DATABASE IF EXISTS ${config.dbName};`
        ]);
        console.log('  [OK] Database dropped');
      }
    } catch (err) {
      console.error('Error checking for existing database:', err);
      // Continue mesmo se falhar
    }

    // Criar database
    console.log('');
    console.log(`  -> Creating database '${config.dbName}'...`);
    await executePsql([
      '-U', config.dbUser,
      '-h', config.dbHost,
      '-c', `CREATE DATABASE ${config.dbName};`
    ]);
    console.log('  [OK] Database created');

    // Executar schema
    console.log('');
    console.log('  -> Executing schema (database.sql)...');
    const sqlContent = fs.readFileSync(config.databaseSqlPath, 'utf8');
    await executePsql([
      '-U', config.dbUser,
      '-h', config.dbHost,
      '-d', config.dbName
    ], sqlContent);
    console.log('  [OK] Schema applied');

    // Verificar tabelas criadas
    console.log('');
    console.log('  -> Verifying created tables...');
    const result = await executePsql([
      '-U', config.dbUser,
      '-h', config.dbHost,
      '-d', config.dbName,
      '-c', '\\dt',
      '-q'
    ]);

    const tableCount = (result.stdout.match(/\n/g) || []).length - 2;
    console.log(`  [OK] Tables created: ${tableCount}`);

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
    if (err.stderr) {
      console.error('[ERROR]', err.stderr.split('\n')[0]);
    } else {
      console.error('[ERROR]', err.message);
    }
    console.error('');
    process.exit(1);
  }
}

// Executar setup
setup();
