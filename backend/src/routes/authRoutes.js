import { Router } from 'express';
import {
  register, login, getMe, updateMe, changePassword,
  updateSettings, exportData, deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.get('/export', protect, exportData);
router.delete('/account', protect, deleteAccount);

export default router;
