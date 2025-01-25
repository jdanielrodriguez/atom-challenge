import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasksController';

const router = Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
