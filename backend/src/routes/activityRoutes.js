import { Router } from 'express';
import { groupFeed, userFeed } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/me', userFeed);
router.get('/groups/:groupId', groupFeed);

export default router;
