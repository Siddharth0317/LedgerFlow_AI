import express from 'express';
import {
  getDashboardStats,
  getWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateWorkflowFromPrompt,
} from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All workflow routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.post('/generate', generateWorkflowFromPrompt);
router.get('/:id', getWorkflowById);
router.put('/:id', updateWorkflow);
router.post('/:id/duplicate', duplicateWorkflow);
router.delete('/:id', deleteWorkflow);

export default router;
