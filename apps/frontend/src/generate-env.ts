const dotenv = require('dotenv');
const { writeFileSync } = require('fs');
const path = require('path');

dotenv.config();

const envPath = path.resolve(__dirname, './environments/environment.ts');
const environmentFile = `
  export const environment = {
    apiKey: '${process.env["NG_APP_FIREBASE_API_KEY"]}',
    authDomain: '${process.env["NG_APP_FIREBASE_AUTH_DOMAIN"]}',
    projectId: '${process.env["NG_APP_FIREBASE_PROJECT_ID"]}',
    storageBucket: '${process.env["NG_APP_FIREBASE_STORAGE_BUCKET"]}',
    messagingSenderId: '${process.env["NG_APP_FIREBASE_MESSAGING_SENDER_ID"]}',
    appId: '${process.env["NG_APP_FIREBASE_APP_ID"]}',
    publicKey: \`${process.env["NG_APP_PUBLIC_KEY"]}\`,
  };
`;

writeFileSync(envPath, environmentFile, { encoding: 'utf8' });
console.log(`Environment file generated at ${envPath}`);
