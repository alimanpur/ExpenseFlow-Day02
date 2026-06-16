import { Router } from 'express';
import {
  monthlySpending, categorySpending, settlementRate,
  groupDebtors, groupCreditors, groupHealth,
  memberComparison, spendingForecast, groupComparison, netBalance
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/monthly', monthlySpending);
router.get('/categories', categorySpending);
router.get('/settlement-rate', settlementRate);
router.get('/forecast', spendingForecast);
router.get('/group-comparison', groupComparison);
router.get('/net-balance', netBalance);
router.get('/groups/:groupId/debtors', groupDebtors);
router.get('/groups/:groupId/creditors', groupCreditors);
router.get('/groups/:groupId/health', groupHealth);
router.get('/groups/:groupId/members', memberComparison);

export default router;
