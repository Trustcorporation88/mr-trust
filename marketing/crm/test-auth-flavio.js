#!/usr/bin/env node

/**
 * Production Authentication Test - Flavio User
 * Tests the complete auth flow with flavio@dicasmei.com.br
 */

const API_BASE_URL = 'https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app/api';

const TEST_USER = {
  email: 'flavio@dicasmei.com.br',
  password: 'Crm57592$'
};

async function makeRequest(method, endpoint, body = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    // Try to parse as JSON, fallback to text
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      error: error.message,
      status: 0
    };
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (e) {
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Production Authentication Test Suite\n');
  console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

  // Test 1: Login
  console.log('═══════════════════════════════════════');
  console.log('Test 1️⃣ : Login with credentials');
  console.log('═══════════════════════════════════════');
  console.log(`POST ${API_BASE_URL}/auth/login`);
  console.log(`Body: {"email":"${TEST_USER.email}","password":"****"}\n`);

  const loginResponse = await makeRequest('POST', '/auth/login', TEST_USER);
  
  if (loginResponse.error) {
    console.log(`❌ Network error: ${loginResponse.error}\n`);
    return;
  }

  console.log(`Status: ${loginResponse.status}`);

  if (loginResponse.status === 401) {
    console.log('❌ Unauthorized - Check if user exists in database\n');
    return;
  }

  if (loginResponse.status === 200) {
    const token = loginResponse.data?.token;
    if (!token) {
      console.log('❌ Login successful but no token in response\n');
      console.log('Response:', loginResponse.data, '\n');
      return;
    }

    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    // Decode JWT
    const decoded = decodeJWT(token);
    if (decoded) {
      console.log('📋 JWT Decoded:');
      console.log(`   - Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
      console.log(`   - Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
      console.log(`   - User ID: ${decoded.userId}`);
      console.log(`   - Email: ${decoded.email}`);
      console.log(`   - Role: ${decoded.role}\n`);
    }

    // Test 2: Refresh token
    console.log('═══════════════════════════════════════');
    console.log('Test 2️⃣ : Refresh token');
    console.log('═══════════════════════════════════════');
    
    const refreshResponse = await makeRequest(
      'POST',
      '/auth/refresh',
      {},
      { 'Authorization': `Bearer ${token}` }
    );

    console.log(`Status: ${refreshResponse.status}`);
    if (refreshResponse.status === 200 && refreshResponse.data?.token) {
      console.log('✅ Token refreshed successfully');
      console.log(`New Token: ${refreshResponse.data.token.substring(0, 20)}...\n`);
    } else {
      console.log('❌ Token refresh failed\n');
      console.log('Response:', refreshResponse.data, '\n');
    }

    // Test 3: Access protected endpoint
    console.log('═══════════════════════════════════════');
    console.log('Test 3️⃣ : Access protected endpoint');
    console.log('═══════════════════════════════════════');
    console.log(`GET ${API_BASE_URL}/services\n`);

    const servicesResponse = await makeRequest(
      'GET',
      '/services',
      null,
      { 'Authorization': `Bearer ${token}` }
    );

    console.log(`Status: ${servicesResponse.status}`);
    if (servicesResponse.status === 200) {
      console.log('✅ Protected endpoint accessible');
      console.log('Response:', servicesResponse.data, '\n');
    } else if (servicesResponse.status === 401) {
      console.log('❌ Unauthorized - JWT may be invalid\n');
    } else {
      console.log('❌ Unexpected response\n');
      console.log('Response:', servicesResponse.data, '\n');
    }
  } else {
    console.log('Response:', loginResponse.data);
    console.log('Headers:', Object.fromEntries(loginResponse.headers));
    console.log(`\n❌ Unexpected response code\n`);
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Test suite completed\n');
}

// Run tests
runTests().catch(console.error);
