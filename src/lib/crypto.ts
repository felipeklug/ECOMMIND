/**
 * Cryptography Helpers for ECOMMIND
 * Secure encryption/decryption and token handling
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  return createHash('sha256').update(key).digest();
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine iv + tag + encrypted data
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

/**
 * Encrypt data and return structured format for Bling tokens
 */
export function encryptToken(token: string): { cipher: string; iv: string; tag: string } {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      cipher: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  } catch (error) {
    throw new Error('Token encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Decrypt token from structured format
 */
export function decryptToken(tokenData: { cipher: string; iv: string; tag: string }): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(tokenData.iv, 'hex');
    const tag = Buffer.from(tokenData.tag, 'hex');
    const encrypted = Buffer.from(tokenData.cipher, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Token decryption failed');
  }
}

/**
 * Hash password with salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = createHash('sha256')
    .update(password)
    .update(salt)
    .digest();
  
  // Combine salt + hash
  const combined = Buffer.concat([salt, hash]);
  return combined.toString('base64');
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const combined = Buffer.from(hashedPassword, 'base64');
    const salt = combined.subarray(0, SALT_LENGTH);
    const hash = combined.subarray(SALT_LENGTH);
    
    const testHash = createHash('sha256')
      .update(password)
      .update(salt)
      .digest();
    
    return timingSafeEqual(hash, testHash);
  } catch (error) {
    return false;
  }
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  const prefix = 'ek_'; // ecommind key
  const random = randomBytes(24).toString('hex');
  return prefix + random;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify API key against hash
 */
export function verifyApiKey(apiKey: string, hashedKey: string): boolean {
  const testHash = hashApiKey(apiKey);
  return timingSafeEqual(Buffer.from(hashedKey, 'hex'), Buffer.from(testHash, 'hex'));
}

/**
 * Create HMAC signature
 */
export function createSignature(data: string, secret: string): string {
  const hmac = createHash('sha256');
  hmac.update(data);
  hmac.update(secret);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifySignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(data, secret);
  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - (visibleChars * 2));
  
  return start + middle + end;
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return generateToken(48);
}

/**
 * Encrypt object for secure storage
 */
export function encryptObject(obj: any): string {
  const json = JSON.stringify(obj);
  return encrypt(json);
}

/**
 * Decrypt object from secure storage
 */
export function decryptObject<T = any>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json);
}

/**
 * Create secure cookie value
 */
export function createSecureCookie(data: any, maxAge: number = 3600): string {
  const payload = {
    data,
    expires: Date.now() + (maxAge * 1000),
  };
  
  return encryptObject(payload);
}

/**
 * Parse secure cookie value
 */
export function parseSecureCookie<T = any>(cookieValue: string): T | null {
  try {
    const payload = decryptObject(cookieValue);
    
    if (payload.expires < Date.now()) {
      return null; // Expired
    }
    
    return payload.data;
  } catch (error) {
    return null; // Invalid cookie
  }
}

/**
 * Generate webhook signature
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return 'sha256=' + createSignature(payload, secret);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Sanitize filename for secure file operations
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

/**
 * Generate secure temporary token with expiration
 */
export function generateTempToken(expiresInMinutes: number = 60): {
  token: string;
  hash: string;
  expires: Date;
} {
  const token = generateToken(32);
  const hash = hashApiKey(token);
  const expires = new Date(Date.now() + (expiresInMinutes * 60 * 1000));
  
  return { token, hash, expires };
}
