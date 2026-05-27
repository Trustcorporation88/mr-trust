const pkg = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Client } = pkg;

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  let client;
  try {
    console.log('[LOGIN] Starting login process...');
    console.log('[LOGIN] Environment check:', {
      DB_HOST: !!process.env.DB_HOST,
      DB_PORT: !!process.env.DB_PORT,
      DB_NAME: !!process.env.DB_NAME,
      DB_USER: !!process.env.DB_USER,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Create database connection
    client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[LOGIN] Connecting to database...');
    await client.connect();
    console.log('[LOGIN] Connected successfully');

    console.log('[LOGIN] Attempting query for email:', email);
    // Query database for user
    const result = await client.query(
      'SELECT id, email, password_hash, full_name, role, company_id FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    console.log('[LOGIN] Query result:', result.rows.length, 'rows found');

    if (result.rows.length === 0) {
      await client.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await client.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        companyId: user.company_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    await client.end();

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('[LOGIN] Error occurred:', err);
    console.error('[LOGIN] Error stack:', err.stack);
    console.error('[LOGIN] Error message:', err.message);
    console.error('[LOGIN] Error code:', err.code);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.error('[LOGIN] Error closing connection:', err);
      }
    }
  }
}

module.exports = handler;
