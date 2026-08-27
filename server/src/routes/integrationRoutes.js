import express from 'express';
import {
  getIntegrations,
  getGoogleAuthUrl,
  handleGoogleCallback,
  connectSlack,
  connectDiscord,
  testIntegrationHandler,
  deleteIntegration,
} from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All integration routes require authentication
router.use(protect);

router.get('/', getIntegrations);
router.get('/google/auth', getGoogleAuthUrl);
router.post('/google/callback', handleGoogleCallback);
router.post('/slack', connectSlack);
router.post('/discord', connectDiscord);
router.post('/test/:id', testIntegrationHandler);
router.delete('/:id', deleteIntegration);

export default router;
