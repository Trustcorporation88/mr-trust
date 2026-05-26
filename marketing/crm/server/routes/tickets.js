import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  resolveTicket,
  submitCSAT,
  getTicketMetrics,
  deleteTicket
} from '../controllers/TicketController.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getTickets);
router.get('/metrics/all', getTicketMetrics);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id', updateTicket);
router.post('/:id/resolve', resolveTicket);
router.post('/:id/csat', submitCSAT);
router.delete('/:id', deleteTicket);

export default router;
