import FirebaseService from './firebaseService';
import { User } from '../interfaces/user.interface';

export const findUserByEmail = async (email: string): Promise<User | null> => {
   const userRecord = await FirebaseService.getUserByEmail(email);
   if (!userRecord) return null;

   return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      createdAt: new Date(),
   };
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

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
   const userRecord = await FirebaseService.getUserByEmail(email);

   if (!userRecord) {
      throw new Error('User not found.');
   }

   const token = await FirebaseService.generateCustomToken(userRecord.uid);

   const user: User = {
      uid: userRecord.uid,
      email: userRecord.email || '', 
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      createdAt: new Date(),
   };

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
