#!/usr/bin/env node

/**
 * MEISHOP CRM - Diagnostic Tool
 * Verifica status de todos os componentes do sistema
 */

const { spawn } = require('child_process');
const { exec } = require('child_process');

const diagnostics = {
  passed: [],
  failed: [],
  warnings: []
};

function log(symbol, text) {
  console.log(`  ${symbol} ${text}`);
}

async function checkDatabase() {
  console.log('\n📊 Database Diagnostic');
  console.log('─────────────────────────────────────────');

  return new Promise((resolve) => {
    exec('psql -U postgres -h localhost -tc "SELECT datname FROM pg_database WHERE datname = \'meishop_crm\';" 2>&1', (err, stdout, stderr) => {
      if (stdout.includes('meishop_crm')) {
        log('✅', 'PostgreSQL database "meishop_crm" exists');
        diagnostics.passed.push('Database exists');
      } else {
        log('❌', 'PostgreSQL database "meishop_crm" NOT found');
        diagnostics.failed.push('Database missing');
      }
      resolve();
    });
  });
}

async function checkNodeModules() {
  console.log('\n📦 Dependencies Check');
  console.log('─────────────────────────────────────────');

  const packages = ['express', 'pg', 'bcryptjs', 'jsonwebtoken', 'cors'];
  let allExist = true;

  for (const pkg of packages) {
    try {
      require(pkg);
      log('✅', `${pkg} installed`);
      diagnostics.passed.push(`${pkg} package`);
    } catch {
      log('⚠️ ', `${pkg} NOT installed - run npm install`);
      diagnostics.warnings.push(`${pkg} missing`);
      allExist = false;
    }
  }

  return allExist;
}

async function checkBackendServer() {
  console.log('\n🔌 Backend Server Status');
  console.log('─────────────────────────────────────────');

  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get('http://localhost:3000/api/v1/health', (res) => {
      if (res.statusCode === 200) {
        log('✅', 'Backend running on port 3000');
        diagnostics.passed.push('Backend online');
      } else if (res.statusCode === 404) {
        log('⚠️ ', 'Backend running but /health endpoint at root level');
        diagnostics.warnings.push('Health check URL mismatch');
      }
      resolve();
    });

    req.on('error', () => {
      log('❌', 'Backend NOT running on port 3000');
      diagnostics.failed.push('Backend offline');
      resolve();
    });

    req.end();
  });
}

async function checkAuthentication() {
  console.log('\n🔐 Authentication Check');
  console.log('─────────────────────────────────────────');

  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');

    const loginData = JSON.stringify({
      email: 'admin@meishop.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          if (json.token) {
            log('✅', 'JWT authentication working');
            diagnostics.passed.push('Auth endpoint');
          }
        } else {
          log('❌', `Auth failed with status ${res.statusCode}`);
          diagnostics.failed.push('Auth broken');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      log('❌', `Auth error: ${e.message}`);
      diagnostics.failed.push('Auth unreachable');
      resolve();
    });

    req.write(loginData);
    req.end();
  });
}

async function checkDataPopulation() {
  console.log('\n📊 Data Population Check');
  console.log('─────────────────────────────────────────');

  return new Promise((resolve) => {
    const http = require('http');

    // Get token first
    const loginData = JSON.stringify({
      email: 'admin@meishop.com',
      password: 'admin123'
    });

    const loginOpts = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    let token = null;

    const loginReq = http.request(loginOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        token = json.token;

        // Check campaigns
        const dataOpts = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/v1/campaigns',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const dataReq = http.request(dataOpts, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const json = JSON.parse(data);
            if (json.total && json.total > 0) {
              log('✅', `${json.total} campaigns found`);
              diagnostics.passed.push('Data populated');
            } else {
              log('⚠️ ', 'No campaigns found');
              diagnostics.warnings.push('Campaigns empty');
            }
            resolve();
          });
        });

        dataReq.on('error', () => {
          log('❌', 'Could not check campaigns');
          resolve();
        });

        dataReq.end();
      });
    });

    loginReq.on('error', (e) => {
      log('❌', 'Could not get token');
      resolve();
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

async function main() {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     MEISHOP CRM - System Diagnostic Tool              ║');
  console.log('║     26 de Maio de 2026                                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await checkNodeModules();
  await checkDatabase();
  await checkBackendServer();
  await checkAuthentication();
  await checkDataPopulation();

  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log(`\n✅ Passed:   ${diagnostics.passed.length}`);
  diagnostics.passed.forEach(p => log('  •', p));

  if (diagnostics.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${diagnostics.warnings.length}`);
    diagnostics.warnings.forEach(w => log('  •', w));
  }

  if (diagnostics.failed.length > 0) {
    console.log(`\n❌ Failed:   ${diagnostics.failed.length}`);
    diagnostics.failed.forEach(f => log('  •', f));
  }

  const total = diagnostics.passed.length + diagnostics.failed.length + diagnostics.warnings.length;
  const health = Math.round((diagnostics.passed.length / total) * 100);

  console.log(`\n📊 Overall Health: ${health}%`);

  if (health >= 90) {
    console.log('   Status: ✅ EXCELLENT');
  } else if (health >= 75) {
    console.log('   Status: ⚠️  GOOD (Minor issues)');
  } else if (health >= 50) {
    console.log('   Status: ⚠️  FAIR (Major issues)');
  } else {
    console.log('   Status: ❌ CRITICAL (System down)');
  }

  console.log('\n');
  process.exit(health >= 75 ? 0 : 1);
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
