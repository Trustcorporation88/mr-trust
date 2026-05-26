import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  getCampaignROI,
  getAllCampaignsROI,
  deleteCampaign
} from '../controllers/CampaignController.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getCampaigns);
router.get('/roi/all', getAllCampaignsROI);
router.get('/:id', getCampaignById);
router.get('/:id/roi', getCampaignROI);
router.post('/', createCampaign);
router.patch('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
