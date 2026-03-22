import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export class StorageType {
  data: any;
  type: StorageTypes;
  expiresAt?: number = new Date().getTime();
  constructor(_data: any, _type: StorageTypes, _expiresAt?: number){
    this.data = _data;
    this.type = _type;
    this.expiresAt = _expiresAt;
  }
}

export enum StorageTypes {
  Local = 'local',
  Session = 'session'
}

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  private _encoder = new TextEncoder();
  private _decoder = new TextDecoder();

  constructor() {}

  public setItem<T extends StorageType>(key: string, value: T, encrypt = false): void {
    const serialised = JSON.stringify(value.data);

    if (encrypt) {
      this.encryptData(serialised).then(encrypted => {
        this._writeToStorage(key, encrypted, value.type);
      });
      return;
    }

    this._writeToStorage(key, serialised, value.type);
  }

  public getItem(key: string, storageType: StorageTypes = StorageTypes.Session, decrypt: boolean = false): string | Promise<string> | undefined {
    let storedItem: string | null = null;
    switch (storageType){
      case StorageTypes.Session: {
        storedItem = sessionStorage.getItem(key);
        break;
      }
      case StorageTypes.Local: {
        storedItem = localStorage.getItem(key);
        break;
      }
      default: {
        console.error("Storage type does not exist");
        break;
      }
    }

    if (storedItem) {
      return decrypt ? this.decryptData(storedItem) : storedItem;
    }
    return undefined;
  }

  public removeItem(key: string, storageType: StorageTypes = StorageTypes.Session): void {
    switch (storageType){
      case StorageTypes.Session: {
        sessionStorage.removeItem(key);
        break;
      }
      case StorageTypes.Local: {
        localStorage.removeItem(key);
        break;
      }
      default: {
        console.error("Storage type does not exist");
        break;
      }
    }
  }

  /**
   * Encrypts data using the native Web Crypto API (AES-GCM).
   * Replaces the vulnerable crypto-js library (CVE-2023-46233).
   */
  public async encryptData(value: string): Promise<string> {
    const key = await this._deriveKey(environment.encryptionKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this._encoder.encode(value)
    );
    // Combine IV + ciphertext and encode as base64 for storage
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts data using the native Web Crypto API (AES-GCM).
   * Replaces the vulnerable crypto-js library (CVE-2023-46233).
   */
  public async decryptData(value: string): Promise<string> {
    const key = await this._deriveKey(environment.encryptionKey);
    const combined = Uint8Array.from(atob(value), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return this._decoder.decode(decrypted);
  }

  /** Derive an AES-GCM CryptoKey from the environment encryption key string */
  private async _deriveKey(passphrase: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this._encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this._encoder.encode('ThortfulChallenge'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private _writeToStorage(key: string, data: string, type: StorageTypes): void {
    if (type === StorageTypes.Local) {
      localStorage.setItem(key, data);
    } else if (type === StorageTypes.Session) {
      sessionStorage.setItem(key, data);
    } else {
      console.error("Storage type not recognised, please use local or session storage.");
    }
  }
}
