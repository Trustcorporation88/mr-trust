const supabaseUrl = 'https://ajcpqhuanqipnwzplqe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY3BxaHVhbnFpcG53emxwcWUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjEwNjA2OCwiZXhwIjoxODkzODcyMDY4fQ.3fEcsn5n3K4h-eUy0DVJ9yYLjAJEuhTpIvZKQ8LmK-E';

async function checkUser() {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.flavio@dicasmei.com.br`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('User data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUser();
