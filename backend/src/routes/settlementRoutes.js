import { Router } from 'express';
import { recordSettlement, verifySettlement, listGroupSettlements, listMySettlements } from '../controllers/settlementController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', recordSettlement);
router.get('/mine', listMySettlements);
router.patch('/:id/verify', verifySettlement);
router.get('/group/:groupId', listGroupSettlements);

export default router;
