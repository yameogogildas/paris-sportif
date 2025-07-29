import express from 'express';
import {
  getMatches,
  updateMatch,
  createMatch
} from '../controllers/matchController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMatches);
router.post('/match', protect, admin, createMatch);
router.put('/match/:id', protect, admin, updateMatch);

export default router;
