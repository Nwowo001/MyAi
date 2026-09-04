/**
 * @fileoverview Encryption utilities for storing sensitive integration credentials.
 *
 * Used to encrypt WhatsApp access tokens, refresh tokens, and other integration
 * secrets before storing them in the database. Uses AES-256-GCM authenticated
 * encryption which provides both confidentiality and integrity.
 *
 * SECURITY NOTES:
 * - The ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars).
 * - A unique random IV is generated for every encryption operation.
 * - The auth tag is verified on decryption, preventing tampering.
 * - Never store the ENCRYPTION_KEY in the database or expose it to the frontend.
 *
 * @example
 * const encrypted = encrypt('my-access-token');
 * const token = decrypt(encrypted); // 'my-access-token'
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV
const TAG_LENGTH = 16; // 128-bit auth tag

/** The encryption key buffer derived from the ENCRYPTION_KEY env variable. */
function getKey(): Buffer {
  return Buffer.from(env.ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded string containing: IV + auth tag + ciphertext.
 *
 * @param plaintext - The string to encrypt
 * @returns Base64-encoded encrypted value (safe to store in the database)
 * @throws {Error} if encryption fails
 */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Layout: [IV (16 bytes)][Auth Tag (16 bytes)][Ciphertext]
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt a value that was encrypted with `encrypt()`.
 *
 * @param encryptedBase64 - The base64-encoded encrypted string
 * @returns The original plaintext string
 * @throws {Error} if decryption fails (invalid key, tampered data, etc.)
 */
export function decrypt(encryptedBase64: string): string {
  const combined = Buffer.from(encryptedBase64, 'base64');

  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted value: too short');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}
