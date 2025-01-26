import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { checkEmail, login, register, logout, deleteUser, changePassword } from '../controllers/authController';

const router = Router();

router.post('/check-email', checkEmail);
router.post('/login', login);
router.post('/register', register);
router.post('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);
router.post('/delete', deleteUser);

export default router;
