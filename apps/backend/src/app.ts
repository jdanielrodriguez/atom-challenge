import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registerRoutes from './routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
registerRoutes(app);

export default app;
