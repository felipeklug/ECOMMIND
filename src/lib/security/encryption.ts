// Security utilities for encrypting sensitive data
// Used for protecting OAuth tokens and other sensitive information

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }
  
  // Ensure key is exactly 32 bytes
  if (key.length < KEY_LENGTH) {
    // Pad with zeros if too short
    return Buffer.concat([Buffer.from(key), Buffer.alloc(KEY_LENGTH - key.length)])
  } else if (key.length > KEY_LENGTH) {
    // Truncate if too long
    return Buffer.from(key).subarray(0, KEY_LENGTH)
  }
  
  return Buffer.from(key)
}

export interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted data with IV and authentication tag
 */
export function encrypt(text: string): EncryptedData {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, key)
    cipher.setAAD(Buffer.from('ecommind-auth'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 * @param encryptedData - Encrypted data with IV and tag
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const key = getEncryptionKey()
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')
    
    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAAD(Buffer.from('ecommind-auth'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Encrypt OAuth tokens for secure storage
 * @param tokens - OAuth token data
 * @returns Encrypted token data
 */
export function encryptTokens(tokens: {
  accessToken: string
  refreshToken: string
  expiresAt?: string
}): {
  encryptedAccessToken: string
  encryptedRefreshToken: string
  expiresAt?: string
} {
  const encryptedAccess = encrypt(tokens.accessToken)
  const encryptedRefresh = encrypt(tokens.refreshToken)
  
  return {
    encryptedAccessToken: JSON.stringify(encryptedAccess),
    encryptedRefreshToken: JSON.stringify(encryptedRefresh),
    expiresAt: tokens.expiresAt
  }
}

/**
 * Decrypt OAuth tokens from storage
 * @param encryptedTokens - Encrypted token data from database
 * @returns Decrypted token data
 */
export function decryptTokens(encryptedTokens: {
  encryptedAccessToken: string
  encryptedRefreshToken: string
  expiresAt?: string
}): {
  accessToken: string
  refreshToken: string
  expiresAt?: string
} {
  const accessData: EncryptedData = JSON.parse(encryptedTokens.encryptedAccessToken)
  const refreshData: EncryptedData = JSON.parse(encryptedTokens.encryptedRefreshToken)
  
  return {
    accessToken: decrypt(accessData),
    refreshToken: decrypt(refreshData),
    expiresAt: encryptedTokens.expiresAt
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Generate secure random string for tokens/secrets
 * @param length - Length of random string
 * @returns Secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Validate encryption key strength
 * @param key - Encryption key to validate
 * @returns True if key is strong enough
 */
export function validateEncryptionKey(key: string): boolean {
  if (key.length < 32) return false
  
  // Check for complexity (letters, numbers, special chars)
  const hasLower = /[a-z]/.test(key)
  const hasUpper = /[A-Z]/.test(key)
  const hasNumber = /\d/.test(key)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(key)
  
  return hasLower && hasUpper && hasNumber && hasSpecial
}

/**
 * Securely wipe sensitive data from memory
 * @param data - Data to wipe
 */
export function secureWipe(data: any): void {
  if (typeof data === 'string') {
    // Overwrite string memory (best effort)
    for (let i = 0; i < data.length; i++) {
      data = data.substring(0, i) + '0' + data.substring(i + 1)
    }
  } else if (typeof data === 'object' && data !== null) {
    // Recursively wipe object properties
    Object.keys(data).forEach(key => {
      secureWipe(data[key])
      delete data[key]
    })
  }
}
