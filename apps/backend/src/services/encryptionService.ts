import * as forge from 'node-forge';
import { config } from 'dotenv';

config();

const privateKeyPem = process.env.PRIVATE_KEY || '';
export const decryptPassword = (encryptedPassword: string): string => {
   try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const decoded = forge.util.decode64(encryptedPassword);
      return privateKey.decrypt(decoded, 'RSA-OAEP', {
         md: forge.md.sha256.create(),
      });
   } catch (error: any) {
      throw new Error('Error desencriptando la contraseña: ' + error.message);
   }
};
