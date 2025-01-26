import { Injectable } from '@angular/core';
import { firebaseAuth } from '../firebase.config';
import { signInWithCustomToken, UserCredential } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  async signInWithToken(customToken: string): Promise<UserCredential> {
    try {
      return await signInWithCustomToken(firebaseAuth, customToken);
    } catch (error) {
      console.error('Error al iniciar sesión con custom token:', error);
      throw error;
    }
  }

  async getIdToken(): Promise<string> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No hay un usuario autenticado.');
    }
    return await currentUser.getIdToken();
  }
}
