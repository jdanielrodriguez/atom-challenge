import { Injectable } from '@angular/core';
import * as forge from 'node-forge';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private publicKeyPem: string;

  constructor() {
    this.publicKeyPem = environment.publicKey;
  }

  encrypt(data: string): string {
    const publicKey = forge.pki.publicKeyFromPem(this.publicKeyPem);
    const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    return forge.util.encode64(encrypted);
  }
}
