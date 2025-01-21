import { Request, Response } from 'express';
import { findUserByEmail, registerUser, loginUser, verifyToken } from '../services/authService';

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;
      const user = await findUserByEmail(email);

      if (user) {
         res.status(200).json({ exists: true, message: 'User exists, proceed to login.' });
      } else {
         res.status(200).json({ exists: false, message: 'User not found, proceed to register.' });
      }
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};

export const register = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password } = req.body;
      const { user, token } = await registerUser(email, password);

      res.status(201).json({ message: 'User registered successfully.', user, token });
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};

export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password } = req.body;

      const { user, token } = await loginUser(email, password);

      res.status(200).json({ message: 'Login successful.', user, token });
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};

export const logout = (req: Request, res: Response): void => {
   res.status(200).json({ message: 'Logout successful.' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
   try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      const user = await verifyToken(token);
      res.status(200).json(user);
   } catch (error: any) {
      res.status(401).json({ error: error.message });
   }
};
