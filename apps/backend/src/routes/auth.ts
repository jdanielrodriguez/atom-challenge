import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { checkEmail, login, register, logout } from '../controllers/authController';

const router = Router();

router.post('/check-email', checkEmail);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticate, logout);

export default router;
