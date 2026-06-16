import { Router } from 'express';
import { parseExpense, triggerAiQuickAdd } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// POST /api/v1/ai/parse-expense — parse text, return structured JSON (no save)
router.post('/parse-expense', parseExpense);

// POST /api/v1/ai/quick-add — parse text, save expense, return record
router.post('/quick-add', triggerAiQuickAdd);

export default router;
