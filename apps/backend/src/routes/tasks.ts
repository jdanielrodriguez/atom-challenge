import { Router } from 'express';
import { getTasks, createTask } from '../controllers/tasksController';

const router = Router();

router.get('/', getTasks);
router.post('/', createTask);

export default router;
