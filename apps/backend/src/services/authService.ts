import FirebaseService from './firebaseService';
import { User } from '../interfaces/user.interface';

export const findUserByEmail = async (email: string) => {
   return FirebaseService.getUserByEmail(email);
};

export const registerUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
   const newUser = await FirebaseService.createUser(email, password);
   const token = await FirebaseService.generateCustomToken(newUser.uid);

   return {
      user: {
         uid: newUser.uid,
         email: newUser.email ?? '',
         displayName: newUser.displayName,
         photoURL: newUser.photoURL,
         createdAt: new Date(),
      },
      token,
   };
};

export const loginUser = async (email: string, password: string) => {
   const user = await FirebaseService.getUserByEmail(email);

   if (!user) {
      throw new Error('User not found.');
   }

   // Nota: Firebase Auth valida contraseñas en el cliente (frontend).
   // Aquí asumimos que la contraseña ya fue validada.

   const token = await FirebaseService.generateCustomToken(user.uid);
   return { user, token };
};

export const verifyToken = async (token: string) => {
   return FirebaseService.verifyIdToken(token);
};

export const deleteUserByEmail = async (email: string): Promise<void> => {
   const user = await findUserByEmail(email);

   if (!user) {
      throw new Error('User not found.');
   }

   await FirebaseService.deleteUser(user.uid);
};
