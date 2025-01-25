import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }

      const decoded = await verifyToken(token);
      (req as any).user = decoded;
      next();
   } catch (error) {
      res.status(401).json({ error: 'Invalid token', details: error });
   }
};
