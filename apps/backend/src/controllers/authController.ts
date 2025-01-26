import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { findUserByEmail, registerUser, loginUser, deleteUserByEmail, validateCurrentPassword, updateUserPassword, generateTokenForUser } from '../services/authService';
import { User } from '../interfaces/user.interface';
import emailService from '../services/emailService';
import { decryptPassword } from './../services/encryptionService';

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
      res.status(500).json({ message: error.message });
   }
};

export const register = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;

      if (!email) {
         res.status(400).json({ message: 'Email is required.' });
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
      res.status(500).json({ message: error.message });
   }
};

export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password: encryptedNewPassword } = req.body;
      const password = decryptPassword(encryptedNewPassword);

      const { user, token }: { user: User; token: string } = await loginUser(email, password);

      res.status(200).json({ message: 'Login successful.', user, token });
   } catch (error: any) {
      res.status(500).json({ message: error.message });
   }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
   try {
      const { currentPassword: encryptedCurrentPassword, newPassword: encryptedNewPassword } = req.body;

      const email = (req as any).user.email;

      if (!email) {
         res.status(400).json({ message: 'Email not found in request.' });
         return;
      }

      if (!encryptedCurrentPassword || !encryptedNewPassword) {
         res.status(400).json({ message: 'Current password and new password are required.' });
         return;
      }
      const currentPassword = decryptPassword(encryptedCurrentPassword);

      const isValid = await validateCurrentPassword(email, currentPassword);
      if (!isValid) {
         res.status(401).json({ message: 'Current password is incorrect.' });
         return;
      }
      const newPassword = decryptPassword(encryptedNewPassword);

      await updateUserPassword(email, newPassword);

      const user = await findUserByEmail(email);
      if (!user) {
         res.status(404).json({ message: 'User not found after password update.' });
         return;
      }

      const tokenAfterUpdate = await generateTokenForUser(user.uid);

      await emailService.sendEmail(
         email,
         'Tu contraseña ha sido actualizada',
         'reset-password',
         { email }
      );

      res.status(200).json({
         message: 'Password updated successfully.',
         token: tokenAfterUpdate,
      });
   } catch (error: any) {
      res.status(500).json({ message: error.message });
   }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;

      if (!email) {
         res.status(400).json({ message: 'El email es obligatorio.' });
         return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
         res.status(404).json({ message: 'Usuario no encontrado.' });
         return;
      }

      const newPassword = crypto.randomBytes(10).toString('hex');
      await updateUserPassword(email, newPassword);

      await emailService.sendEmail(email, 'Recuperación de Contraseña', 'reset-password', {
         email,
         newPassword,
      });

      res.status(200).json({ message: 'Se ha enviado un correo con tu nueva contraseña.' });
   } catch (error: any) {
      res.status(500).json({ message: 'Error al restablecer la contraseña.', details: error.message });
   }
};

export const logout = (req: Request, res: Response): void => {
   res.status(200).json({ message: 'Logout successful.' });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email } = req.body;

      if (!email) {
         res.status(400).json({ message: 'Email is required.' });
         return;
      }

      await deleteUserByEmail(email);

      res.status(200).json({ message: 'User deleted successfully.' });
   } catch (error: any) {
      res.status(500).json({ message: error.message });
   }
};
