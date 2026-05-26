import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import dealRoutes from './routes/deals.js';
import ticketRoutes from './routes/tickets.js';
import campaignRoutes from './routes/campaigns.js';
import servicesRoutes from './routes/services.js';

// Import database
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Logging
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      database: 'disconnected'
    });
  }
});

// ============================================
// ROUTES
// ============================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/services', servicesRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(' MEISHOP CRM API - Server Started');
  console.log(`${'='.repeat(50)}`);
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
});

export default app;
