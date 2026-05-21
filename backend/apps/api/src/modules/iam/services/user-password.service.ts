import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, type ScryptOptions, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function deriveKey(password: string, salt: string, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

@Injectable()
export class UserPasswordService {
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await deriveKey(password, salt, SCRYPT_KEY_LENGTH, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    });

    return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derivedKey.toString('hex')}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [algorithm, n, r, p, salt, storedHash] = hash.split('$');

    if (algorithm !== 'scrypt' || !n || !r || !p || !salt || !storedHash) {
      return false;
    }

    const storedBuffer = Buffer.from(storedHash, 'hex');
    const derivedKey = await deriveKey(password, salt, storedBuffer.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });

    if (storedBuffer.length !== derivedKey.length) return false;

    return timingSafeEqual(storedBuffer, derivedKey);
  }
}
