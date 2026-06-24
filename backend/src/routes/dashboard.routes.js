import express from 'express';
import {
  createPrice,
  createSubscription,
  getAdminDashboard,
  getFarmerDashboard,
  verifyPrice
} from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.post('/admin/prices', authenticate, authorize('admin'), createPrice);
router.patch('/admin/prices/:id/verify', authenticate, authorize('admin'), verifyPrice);

router.get('/farmer', authenticate, authorize('farmer'), getFarmerDashboard);
router.post('/farmer/subscriptions', authenticate, authorize('farmer'), createSubscription);

export default router;
