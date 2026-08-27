import express from 'express';
import {
  getExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecutionHandler,
  resumeExecutionHandler,
  cancelExecutionHandler,
} from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All execution routes require authentication
router.use(protect);

router.get('/', getExecutions);
router.get('/:id', getExecutionById);
router.get('/:id/timeline', getExecutionTimeline);
router.post('/:id/pause', pauseExecutionHandler);
router.post('/:id/resume', resumeExecutionHandler);
router.post('/:id/cancel', cancelExecutionHandler);

export default router;
