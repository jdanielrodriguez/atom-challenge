import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import tasksRouter from './routes/tasks';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/tasks', tasksRouter);

export default app;
