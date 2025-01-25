import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { findUserByEmail, registerUser, loginUser, deleteUserByEmail } from '../services/authService';
import { User } from '../interfaces/user.interface';
import emailService from '../services/emailService';

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;
      const user: User | null = await findUserByEmail(email);

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
      const { email } = req.body;

      if (!email) {
         res.status(400).json({ error: 'Email is required.' });
         return;
      }

      const password = crypto.randomBytes(10).toString('hex');
      const { user, token } = await registerUser(email, password);
      await emailService.sendEmail(email, 'Bienvenido a Atom Challenge', 'welcome', {
         email,
         password,
      });
      res.status(201).json({ message: 'User registered successfully.', user, token });
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};

export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password } = req.body;

      const { user, token }: { user: User; token: string } = await loginUser(email, password);

      res.status(200).json({ message: 'Login successful.', user, token });
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};

export const logout = (req: Request, res: Response): void => {
   res.status(200).json({ message: 'Logout successful.' });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;

      if (!email) {
         res.status(400).json({ error: 'Email is required.' });
         return;
      }

      await deleteUserByEmail(email);

      res.status(200).json({ message: 'User deleted successfully.' });
   } catch (error: any) {
      res.status(500).json({ error: error.message });
   }
};
