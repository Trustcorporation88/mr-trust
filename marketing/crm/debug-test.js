const API_BASE = 'https://crm-k7zwnyofv-trustcorporation88s-projects.vercel.app';
const BYPASS_TOKEN = 'jKH1ewRWPcQGryYDvu7z1pqfoMtRizEj';

(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': BYPASS_TOKEN
      },
      body: JSON.stringify({
        email: 'flavio@dicasmei.com.br',
        password: 'Crm57592$'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Raw Response:', text.substring(0, 500));
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Not JSON, raw text shown above');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
