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
  return { status: response.status, body: text };
}

(async () => {
  const res = await makeRequest('POST', '/api/auth/login', {
    email: 'flavio@dicasmei.com.br',
    password: 'Crm57592$'
  });
  console.log('Status:', res.status);
  console.log('Response body:');
  console.log(res.body);
})();
