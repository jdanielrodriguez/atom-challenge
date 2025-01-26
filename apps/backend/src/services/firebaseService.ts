import * as admin from 'firebase-admin';

class FirebaseService {
   private auth: admin.auth.Auth;
   private firestore: admin.firestore.Firestore;

   constructor() {
      if (!admin.apps.length) {
         admin.initializeApp({
            credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
         });
      }
      this.auth = admin.auth();
      this.firestore = admin.firestore();
   }

   async createUser(email: string, password: string): Promise<admin.auth.UserRecord> {
      return this.auth.createUser({ email, password });
   }

   async getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
      try {
         return await this.auth.getUserByEmail(email);
      } catch (error: any) {
         if (error.code === 'auth/user-not-found') return null;
         throw error;
      }
   }

   async validatePassword(email: string, password: string): Promise<boolean> {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;
      const response = await fetch(url, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password, returnSecureToken: true }),
      });

      if (!response.ok) {
         throw new Error(`Invalid credentials for email: ${email}`);
      }

      const data = await response.json();
      return !!data.idToken;
   }

   async generateCustomToken(uid: string): Promise<string> {
      return this.auth.createCustomToken(uid);
   }

   async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
      return this.auth.verifyIdToken(token);
   }

   getFirestore(): admin.firestore.Firestore {
      return this.firestore;
   }

   async deleteUser(uid: string): Promise<void> {
      await this.auth.deleteUser(uid);
   }

   formatTimestamp(date: Date) {
      return admin.firestore.Timestamp.fromDate(date);
   }

   updateUserPassword = async (uid: string, newPassword: string): Promise<void> => {
      await admin.auth().updateUser(uid, { password: newPassword });
   };
}

export default new FirebaseService();
