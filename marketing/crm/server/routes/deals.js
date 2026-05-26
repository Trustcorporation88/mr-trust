import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  changeStage,
  markAsWon,
  markAsLost,
  getDealsGroupedByStage,
  deleteDeal
} from '../controllers/DealController.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getDeals);
router.get('/grouped/stage', getDealsGroupedByStage);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.patch('/:id', updateDeal);
router.post('/:id/stage', changeStage);
router.post('/:id/won', markAsWon);
router.post('/:id/lost', markAsLost);
router.delete('/:id', deleteDeal);

export default router;
