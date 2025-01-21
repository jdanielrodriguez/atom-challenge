import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
   throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not defined in .env');
}

admin.initializeApp({
   credential: admin.credential.cert(require(serviceAccountPath)),
});

export default admin.firestore();
