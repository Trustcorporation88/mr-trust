module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    console.log('Health check requested');
    console.log('Environment variables available:');
    console.log('- DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
    console.log('- DB_PORT:', process.env.DB_PORT ? 'SET' : 'MISSING');
    console.log('- DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');
    console.log('- DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING');
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        DB_HOST: process.env.DB_HOST ? 'CONFIGURED' : 'MISSING',
        DB_PORT: process.env.DB_PORT ? 'CONFIGURED' : 'MISSING',
        DB_NAME: process.env.DB_NAME ? 'CONFIGURED' : 'MISSING',
        DB_USER: process.env.DB_USER ? 'CONFIGURED' : 'MISSING',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'CONFIGURED' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'CONFIGURED' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'not set'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
};
