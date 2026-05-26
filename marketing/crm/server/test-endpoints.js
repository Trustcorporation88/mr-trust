#!/usr/bin/env node

/**
 * Test script para validar endpoints do MEISHOP CRM
 */

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = null;

const tests = [];

async function test(name, method, path, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    const status = response.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} - ${method} ${path}`);
    
    if (!response.ok) {
      console.log(`       Status: ${response.status}`);
      console.log(`       Error: ${data.error || JSON.stringify(data).substring(0, 100)}`);
    } else {
      if (data.token) {
        authToken = data.token;
        console.log(`       Token: ${data.token.substring(0, 20)}...`);
      }
      if (data.message) {
        console.log(`       Message: ${data.message}`);
      }
    }

    tests.push({
      name,
      path,
      method,
      passed: response.ok
    });

    return data;
  } catch (err) {
    console.log(`  ❌ ERROR - ${method} ${path}`);
    console.log(`       ${err.message}`);
    tests.push({
      name,
      path,
      method,
      passed: false
    });
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  MEISHOP CRM - Endpoint Tests');
  console.log('========================================');
  console.log('');

  // ============================================
  // 1. Health Check
  // ============================================
  console.log('1. Health Check:');
  await test('Health', 'GET', '/health');
  console.log('');

  // ============================================
  // 2. Auth Tests
  // ============================================
  console.log('2. Authentication:');
  await test('Login', 'POST', '/auth/login', {
    email: 'admin@meishop.com',
    password: 'admin123'
  });
  console.log('');

  // ============================================
  // 3. Deals Tests
  // ============================================
  console.log('3. Deals:');
  await test('List Deals', 'GET', '/deals');
  await test('Get Deal by Stage', 'GET', '/deals?stage=lead');
  console.log('');

  // ============================================
  // 4. Tickets Tests
  // ============================================
  console.log('4. Tickets:');
  await test('List Tickets', 'GET', '/tickets');
  await test('Get Tickets by Priority', 'GET', '/tickets?priority=high');
  await test('Get Ticket Metrics', 'GET', '/tickets/metrics');
  console.log('');

  // ============================================
  // 5. Campaigns Tests
  // ============================================
  console.log('5. Campaigns:');
  await test('List Campaigns', 'GET', '/campaigns');
  await test('Get Campaign ROI', 'GET', '/campaigns/roi');
  console.log('');

  // ============================================
  // Summary
  // ============================================
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  const passPercentage = Math.round((passed / total) * 100);

  console.log('========================================');
  console.log('  TEST RESULTS');
  console.log('========================================');
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${passPercentage}%`);
  console.log('');

  if (passPercentage === 100) {
    console.log('🎉 All tests passed!');
  } else if (passPercentage >= 80) {
    console.log('⚠️  Most tests passed, but some endpoints need attention');
  } else {
    console.log('❌ Several tests failed, review the errors above');
  }

  console.log('');
  process.exit(passPercentage === 100 ? 0 : 1);
}

runTests();
