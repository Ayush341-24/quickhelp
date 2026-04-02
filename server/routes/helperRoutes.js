import express from 'express';
const router = express.Router();
import { getHelpers, updateLocation } from '../controllers/helperController.js';
import { protect, helperOnly } from '../middleware/authMiddleware.js';

router.get('/', getHelpers);
router.put('/location', protect, helperOnly, updateLocation);

export default router;
