const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test password matching
const user = {
  id: 'dff6cd97-cb68-40be-91f1-a7fa164dd492',
  email: 'flavio@dicasmei.com.br',
  password_hash: '$2b$10$NCLzTepEcBrKr650ed9gs.wiFJebTwRUwSEXHTs6Ycxs18ThFft3a',
  full_name: 'Flavio',
  role: 'admin',
  company_id: 'abc123'
};

const password = 'Crm57592$';

(async () => {
  try {
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('✓ Password valid:', isValid);
    
    if (isValid) {
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id 
        },
        'your-secret-key',
        { expiresIn: '7d' }
      );
      console.log('✓ JWT generated:', token.substring(0, 50) + '...');
      
      const decoded = jwt.verify(token, 'your-secret-key');
      console.log('✓ JWT verified:', decoded);
    }
  } catch (err) {
    console.error('✗ Error:', err.message);
  }
})();
