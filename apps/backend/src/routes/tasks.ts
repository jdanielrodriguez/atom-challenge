import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getTasks, createTask } from '../controllers/tasksController';

const router = Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);

export default router;
