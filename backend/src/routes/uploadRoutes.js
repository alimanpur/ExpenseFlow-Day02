import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadReceipt } from '../config/cloudinary.js';
import { uploadReceiptHandler } from '../controllers/uploadController.js';

const router = Router();
router.use(protect);

router.post('/receipt', uploadReceipt.single('receipt'), uploadReceiptHandler);

export default router;
