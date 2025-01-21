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

   async generateCustomToken(uid: string): Promise<string> {
      return this.auth.createCustomToken(uid);
   }

   async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
      return this.auth.verifyIdToken(token);
   }

   getFirestore(): admin.firestore.Firestore {
      return this.firestore;
   }
}

export default new FirebaseService();
