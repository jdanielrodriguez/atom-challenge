import { Express } from 'express';
import authRoutes from './auth';
import taskRoutes from './tasks';
import healthRoutes from './health';

const registerRoutes = (app: Express): void => {
   app.use('/api/auth', authRoutes);
   app.use('/api/tasks', taskRoutes);
   app.use('/api/health', healthRoutes);
};

export default registerRoutes;
