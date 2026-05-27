const API_BASE = 'https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app';
const BYPASS_TOKEN = 'jKH1ewRWPcQGryYDvu7z1pqfoMtRizEj';

async function makeRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-protection-bypass': BYPASS_TOKEN
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    return { status: response.status, data: null, raw: text.substring(0, 200) };
  }
}

(async () => {
  console.log('🔓 Testing with Bypass Token: ' + BYPASS_TOKEN.substring(0, 10) + '...\n');
  
  console.log('1️⃣  POST /api/auth/login');
  const login = await makeRequest('POST', '/api/auth/login', {
    email: 'flavio@dicasmei.com.br',
    password: 'Crm57592$'
  });
  console.log(`   Status: ${login.status}`);
  console.log(`   Data:`, login.data);
  
  if (login.status === 200 && login.data?.token) {
    console.log('\n✅ Login sucesso!');
    console.log('   Token (primeiros 50 chars):', login.data.token.substring(0, 50) + '...');
  } else {
    console.log('\n❌ Login falhou');
  }
})();
