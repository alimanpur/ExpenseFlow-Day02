import { Router } from 'express';
import { logManualExpense, removeExpense, listCategories, addCategory } from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/manual', logManualExpense);
router.delete('/:id', removeExpense);
router.get('/categories', listCategories);
router.post('/categories', addCategory);

export default router;
