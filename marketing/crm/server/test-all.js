#!/usr/bin/env node

/**
 * Comprehensive test script para MEISHOP CRM
 */

const BASE_URL = 'http://localhost:3000/api/v1';
let token = null;

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function test(name, method, path, expectedStatus = 200, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token && path !== '/auth/login') {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    const passed = response.status === expectedStatus;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    
    results.tests.push({
      name,
      path,
      method,
      status: response.status,
      expected: expectedStatus,
      passed
    });

    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }

    console.log(`  ${status} [${response.status}] ${method.padEnd(6)} ${path}`);
    
    if (data.token) {
      token = data.token;
    }
    
    if (data.total !== undefined) {
      console.log(`       └─ ${data.total} items returned`);
    }

    return { data, response };
  } catch (err) {
    results.failed++;
    results.tests.push({
      name,
      path,
      method,
      passed: false,
      error: err.message
    });
    
    console.log(`  ❌ ERROR [${method.padEnd(6)}] ${path}`);
    console.log(`       └─ ${err.message}`);
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  MEISHOP CRM - Full Endpoint Test');
  console.log('========================================');
  console.log('');

  // ============================================
  // 1. Health & Auth
  // ============================================
  console.log('1. Health & Authentication:');
  await test('Health Check', 'GET', '/health', 200);
  await test('Login Success', 'POST', '/auth/login', 200, {
    email: 'admin@meishop.com',
    password: 'admin123'
  });
  await test('Login Failed', 'POST', '/auth/login', 401, {
    email: 'admin@meishop.com',
    password: 'wrongpassword'
  });
  console.log('');

  // ============================================
  // 2. Deals
  // ============================================
  console.log('2. Deals Endpoint:');
  await test('List Deals', 'GET', '/deals', 200);
  await test('List Deals (stage filter)', 'GET', '/deals?stage=lead', 200);
  await test('List Deals (probability)', 'GET', '/deals?probability=100', 200);
  console.log('');

  // ============================================
  // 3. Tickets
  // ============================================
  console.log('3. Tickets Endpoint:');
  await test('List Tickets', 'GET', '/tickets', 200);
  await test('List Tickets (priority)', 'GET', '/tickets?priority=high', 200);
  await test('Ticket Metrics', 'GET', '/tickets/metrics', 200);
  console.log('');

  // ============================================
  // 4. Campaigns
  // ============================================
  console.log('4. Campaigns Endpoint:');
  await test('List Campaigns', 'GET', '/campaigns', 200);
  await test('Campaign ROI', 'GET', '/campaigns/roi', 200);
  console.log('');

  // ============================================
  // Summary
  // ============================================
  const total = results.passed + results.failed;
  const percentage = Math.round((results.passed / total) * 100);

  console.log('========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================');
  console.log(`Total Tests:  ${total}`);
  console.log(`Passed:       ${results.passed}`);
  console.log(`Failed:       ${results.failed}`);
  console.log(`Success Rate: ${percentage}%`);
  console.log('');

  if (percentage === 100) {
    console.log('🎉 All tests passed!');
  } else if (percentage >= 75) {
    console.log('✅ Most tests passed!');
  } else if (percentage >= 50) {
    console.log('⚠️  Half tests passed, review failures');
  } else {
    console.log('❌ Most tests failed');
  }

  console.log('');
  console.log('Endpoint Status:');
  results.tests.forEach(t => {
    const icon = t.passed ? '✅' : '❌';
    console.log(`  ${icon} ${t.name.padEnd(25)} [${t.status}]`);
  });

  console.log('');
  process.exit(percentage === 100 ? 0 : 1);
}

runTests();
