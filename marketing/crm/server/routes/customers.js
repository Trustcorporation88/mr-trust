import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/CustomerController.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticateToken);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
